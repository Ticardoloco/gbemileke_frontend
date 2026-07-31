"use client"
import { usePathname } from "next/navigation";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export default function HeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();
    const notAdmin = pathname.startsWith("/admin")
  return (
      <div>
        {!notAdmin && <SiteHeader/>}
        {children}
        {!notAdmin && <SiteFooter/>}
      </div>

  );
}
