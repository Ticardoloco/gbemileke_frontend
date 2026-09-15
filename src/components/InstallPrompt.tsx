/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Download, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if user is on iOS (Safari doesn't support beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    
    // Check if the app is already installed/running in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return; // Already installed, do nothing
    }

    if (isIosDevice) {
      setIsIOS(true);
      // Optional: Show prompt for iOS if not dismissed before
      const iosDismissed = localStorage.getItem("pwa_prompt_dismissed");
      if (!iosDismissed) {
        setShowPrompt(true);
      }
      return;
    }

    // 2. Listen for Chrome/Android native install trigger
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      const dismissed = localStorage.getItem("pwa_prompt_dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show native browser install dialog
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember user choice so you don't annoy them on every page refresh
    localStorage.setItem("pwa_prompt_dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-primary/20 bg-background/95 p-4 shadow-xl backdrop-blur-md sm:bottom-6 sm:right-6 sm:mx-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Install Gbemileke App
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Get quick access to care, bookings, and medicine orders directly from your home screen.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {isIOS ? (
        <div className="mt-3 rounded-lg bg-secondary/60 p-2.5 text-xs text-muted-foreground">
          Tap <span className="font-semibold text-foreground">Share</span> below and select{" "}
          <span className="font-semibold text-foreground">Add to Home Screen</span>.
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-xs">
            Maybe later
          </Button>
          <Button size="sm" onClick={handleInstallClick} className="gap-1.5 text-xs font-semibold">
            <Download className="h-3.5 w-3.5" /> Install App
          </Button>
        </div>
      )}
    </div>
  );
}