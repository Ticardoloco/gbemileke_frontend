"use client";
import { usePathname } from "next/navigation";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export default function HeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const noHeaderRoutes = ["/admin", "/practitioner"];
  const isNoHeaderRoute = noHeaderRoutes.some((route) =>
    pathname.startsWith(route),
  );
  return (
    <div>
      {!isNoHeaderRoute && <SiteHeader />}
      {children}
      {!isNoHeaderRoute && <SiteFooter />}
    </div>
  );
}
