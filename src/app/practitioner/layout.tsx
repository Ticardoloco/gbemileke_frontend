import ProtectedRoute from "@/components/auth/ProtectRoute";
import GlobalPractitionerLayout from "@/components/practitioner/PractitionerLayout";

export default function PractitionerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["practitioner"]}> 
    <GlobalPractitionerLayout>
      {children}
    </GlobalPractitionerLayout>
    </ProtectedRoute>
  );
}