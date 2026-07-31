"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Leaf, 
  ShoppingCart, 
  User as UserIcon, 
  Menu, 
  X, 
  CreditCard, 
  LogOut, 
  ChevronDown,
  Calendar
} from "lucide-react";
import { useState } from "react";
import { useApp } from "@/store/appStore";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nav = [
  { href: "/", label: "Home" },
  { href: "/specialties", label: "Specialties" },
  { href: "/patient-card", label: "Patient Card" },
  { href: "/shop", label: "Herbal Store" },
];

export function SiteHeader() {
  // 1. Destructure logout along with cart and user
  const { cart, user, logout } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // Fallbacks for patient details
  const patientId = user?.id || "GBH-2026-8812";
  const displayName = user?.fullName || user?.fullName || "Patient";
  const userFirstName = displayName.split(" ")[0];

  // 2. Updated handleLogout to call store logout before redirecting
  const handleLogout = () => {
    logout(); // Clears user from Zustand/Context state and localStorage
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <div className="font-display text-base font-semibold text-foreground">
              Gbemileke
            </div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Tradomedical
            </div>
          </div>
        </Link>

        {/* Desktop Main Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => {
            const active =
              n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-secondary text-secondary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {/* Shopping Cart */}
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {cartCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]">
                {cartCount}
              </Badge>
            )}
          </Link>

          {/* Dynamic User Navigation */}
          {user ? (
            /* LOGGED IN: Profile Button & Patient Card Dropdown */
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/profile"
                className={buttonVariants({
                  variant: pathname === "/profile" ? "secondary" : "ghost",
                  size: "sm",
                  className: "gap-2 text-xs font-semibold",
                })}
              >
                <UserIcon className="h-4 w-4 text-primary" />
                Profile
              </Link>

              {/* Patient Card Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs hover:border-primary/40 focus:outline-none transition-all shadow-sm">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                    {userFirstName.charAt(0)}
                  </div>
                  <span className="font-semibold text-foreground">
                    {userFirstName}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-72 p-2">
                  {/* Digital Patient ID Card Banner */}
                  <div className="rounded-xl bg-gradient-to-br from-primary/15 via-primary/5 to-secondary p-3.5 border border-primary/20 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-primary">
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3.5 w-3.5" /> Digital Patient ID
                      </span>
                      <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px]">
                        ACTIVE
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {displayName}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        ID: {patientId}
                      </p>
                    </div>
                  </div>

                  <DropdownMenuSeparator className="my-2" />

                  <DropdownMenuItem
                    onClick={() => router.push("/patient")}
                    className="cursor-pointer text-xs flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4 text-primary" /> My Care Dashboard
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="cursor-pointer text-xs flex items-center gap-2"
                  >
                    <UserIcon className="h-4 w-4 text-primary" /> My Profile
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            /* LOGGED OUT: Login and Register Links */
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "text-xs font-semibold",
                })}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className={buttonVariants({
                  variant: "default",
                  size: "sm",
                  className: "text-xs font-semibold shadow-sm",
                })}
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1 p-3">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}

            <div className="my-1 border-t border-border" />

            {user ? (
              <div className="space-y-3 pt-1">
                {/* Mobile Patient Card */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-primary uppercase">
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" /> Patient Card
                    </span>
                    <span>{patientId}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{displayName}</p>
                </div>

                <div className="grid gap-1">
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-secondary"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                  >
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full justify-center text-sm",
                  })}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({
                    variant: "default",
                    className: "w-full justify-center text-sm font-semibold",
                  })}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}