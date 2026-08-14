/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/store/appStore";
import { getStoredUser } from "@/api/apiClient";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user } = useApp();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check Zustand state first, fallback to localStorage if refreshing page
    const currentUser = user || getStoredUser();

    // 1. If not logged in at all -> redirect to login
    if (!currentUser) {
      router.replace("/login");
      return;
    }

    const userRole = currentUser.role?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map((r) => r.toLowerCase());

    // 2. If role matches -> allow access
    if (userRole && normalizedAllowedRoles.includes(userRole)) {
      setIsAuthorized(true);
    } else {
      // 3. If role doesn't match -> kick them back to their authorized area
      if (userRole === "practitioner") {
        router.replace("/practitioner");
      } else if (userRole === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/patient");
      }
    }
  }, [user, allowedRoles, router]);

  // Prevent UI flash while checking permissions
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}