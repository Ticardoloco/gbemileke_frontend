"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/store/appStore";
import {
  LayoutDashboard,
  Users,
  Package,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Leaf,
  ShieldCheck,
  Phone,
  MapPin,
  CheckCircle2,
  CalendarDays,
  Activity,
} from "lucide-react";

interface GlobalPractitionerLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: "Dashboard", href: "/practitioner", icon: LayoutDashboard },
  { label: "Patient Cards", href: "/practitioner/patients", icon: Users },
  { label: "Products Ordered", href: "/practitioner/orders", icon: Package },
  { label: "Appointments", href: "/practitioner/appointments", icon: Calendar },
  { label: "Settings", href: "/practitioner/settings", icon: Settings },
];

export default function GlobalPractitionerLayout({
  children,
}: GlobalPractitionerLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnDuty, setIsOnDuty] = useState(true);
  const { user, logout } = useApp();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Resolve current active page title
  const currentNavItem = navItems.find((item) =>
    item.href === "/practitioner"
      ? pathname === "/practitioner"
      : pathname.startsWith(item.href)
  );

  const activePageTitle = currentNavItem ? currentNavItem.label : "Practitioner Workspace";

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "PR";

  const shortId = user?.id ? `PR-${user.id.slice(-6).toUpperCase()}` : "PR-000000";
  const locationText = user?.address
    ? `${user.address.street ? user.address.street + ", " : ""}${user.address.city || user.address.state || ""}`
    : "Lagos, Nigeria";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col lg:flex-row">
      {/* Mobile Header Bar */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-base shadow-xs">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base leading-tight">
              Gbemileke
            </h1>
            <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
              Practitioner Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-600 bg-emerald-100 flex items-center justify-center font-bold text-emerald-900 text-sm">
            {initials}
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 bottom-0 z-50 w-80 bg-slate-900 text-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 h-screen ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-md">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg leading-tight">
                  Gbemileke
                </h2>
                <p className="text-xs text-emerald-400 font-medium">
                  Tradomedical Hospital
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Practitioner Digital Profile Card */}
          <div className="mx-4 mt-5 p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/70 shadow-inner">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full border-2 border-emerald-500 bg-emerald-900 text-emerald-100 flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-white truncate capitalize">
                    {user?.fullName}
                  </p>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <p className="text-xs text-emerald-400 capitalize font-medium">
                  {user?.role}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Sub-Metadata (ID, Phone, Location, Duty Status) */}
            <div className="mt-4 pt-3.5 border-t border-slate-700/60 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-1.5 font-mono text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {shortId}
                </span>
                <button
                  onClick={() => setIsOnDuty(!isOnDuty)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isOnDuty
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOnDuty ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                  {isOnDuty ? "On Duty" : "Away"}
                </button>
              </div>

              {user?.phoneNumber && (
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{user.phoneNumber}</span>
                </div>
              )}

              {user?.address && (
                <div className="flex items-center gap-2 text-slate-300 text-xs truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{locationText}</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <p className="px-3 text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
              Main Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/practitioner"
                  ? pathname === "/practitioner"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-700 text-white shadow-md font-bold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-white" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sign Out Button */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-30 shadow-xs">
          {/* Active Page Context & Date */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {activePageTitle}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-700" />
                <span>{todayDate}</span>
              </div>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-semibold">
              <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Clinical Workspace Active</span>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            {/* User Profile Summary */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-600 bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-sm shrink-0">
                {initials}
              </div>
              <div className="text-left leading-tight">
                <p className="text-sm font-bold text-slate-900 capitalize">
                  {user?.fullName}
                </p>
                <p className="text-xs text-emerald-700 capitalize font-medium mt-0.5">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}