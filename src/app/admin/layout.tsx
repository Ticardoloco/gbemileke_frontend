"use client";

import ProtectedRoute from "@/components/auth/ProtectRoute";
import GlobalAdminLayout from "@/components/admin/GlobalAdminLayout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <GlobalAdminLayout>{children}</GlobalAdminLayout>
    </ProtectedRoute>
  );
}