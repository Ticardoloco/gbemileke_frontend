"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { getPatientCard, PatientCardDetails } from "@/services/userService";
import { useApp } from "@/store/appStore";
import { ShareStoryModal } from "@/components/modals/ShareStoryModel";

interface SessionMonitorContextType {
  checkPendingSessions: () => Promise<void>;
}

const SessionMonitorContext = createContext<SessionMonitorContextType>({
  checkPendingSessions: async () => {},
});

export const SessionMonitorProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useApp();
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [closedSessionTitle, setClosedSessionTitle] = useState<string>("");
  const [activeSpecialty, setActiveSpecialty] = useState<string>("");

  const prevSessionsRef = useRef<Map<string, boolean>>(new Map());

  const pollSessions = useCallback(async () => {
    // Skip network call if user is logged out, tab is hidden, or modal is already active
    if (!user || isShareModalOpen || typeof document !== "undefined" && document.hidden) return;

    try {
      const res = await getPatientCard();
      const fetchedCards: PatientCardDetails[] = res?.cards || [];

      fetchedCards.forEach((card) => {
        const sessions = card.billing?.sessions || [];

        sessions.forEach((session) => {
          const sessionId = session._id;
          const isNowClosed = Boolean(session.isClosed);
          const wasClosedPreviously = prevSessionsRef.current.get(sessionId);

          if (isNowClosed) {
            const storageKey = `hasPromptedShare_${sessionId}`;
            const hasBeenPrompted = localStorage.getItem(storageKey);

            // TRIGGER CONDITIONS:
            // 1. Session just closed while logged in
            // 2. Session closed while logged out, and user just logged in
            if (!hasBeenPrompted && (wasClosedPreviously === false || wasClosedPreviously === undefined)) {
              setClosedSessionTitle(session.title || "Treatment Session");
              setActiveSpecialty(card.specialty || "General");
              setIsShareModalOpen(true);
              localStorage.setItem(storageKey, "true");
            }
          }

          prevSessionsRef.current.set(sessionId, isNowClosed);
        });
      });
    } catch (error) {
      console.error("[SessionMonitor] Error checking session status:", error);
    }
  }, [user, isShareModalOpen]);

  // Run only on user auth state change / initial page mount
  useEffect(() => {
    if (!user) {
      prevSessionsRef.current.clear();
      return;
    }

    // Single check on mount / login
    pollSessions();
  }, [user, pollSessions]);

  return (
    <SessionMonitorContext.Provider value={{ checkPendingSessions: pollSessions }}>
      {children}

      {/* Global Share Modal rendered across all routes when user is logged in */}
      {ShareStoryModal && user && (
        <ShareStoryModal
          name={user?.fullName}
          care={activeSpecialty}
          sessionTitle={closedSessionTitle}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </SessionMonitorContext.Provider>
  );
};

export const useSessionMonitor = () => useContext(SessionMonitorContext);