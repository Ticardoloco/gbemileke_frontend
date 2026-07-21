import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { AppProvider } from "@/lib/app-store";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css"; // Your Tailwind v4 stylesheet
import HeaderLayout from "@/components/HeaderLayout";

// Next.js automatically injects standard Google Fonts into your HTML document optimizations
const sansFont = Inter({ subsets: ["latin"], variable: "--font-sans" });
const displayFont = Fraunces({ subsets: ["latin"], variable: "--font-display" });

// This completely replaces your TanStack head() configuration object
export const metadata: Metadata = {
  title: "Gbemileke Tradomedical Hospital — Holistic Care Rooted in Tradition",
  description: "Traditional herbal medicine meets modern wellness. Maternal care, bone setting, stroke recovery, fertility, and a curated herbal pharmacy.",
  openGraph: {
    title: "Gbemileke Tradomedical Hospital — Holistic Care Rooted in Tradition",
    description: "Traditional herbal medicine meets modern wellness.",
    type: "website",
    images: ["https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2c836064-519a-4426-a65c-e23fd28e400e/id-preview-01a3ae3e--143744e5-de94-4d8b-b68c-8c4663aa4e2f.lovable.app-1783947107581.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gbemileke Tradomedical Hospital — Holistic Care Rooted in Tradition",
    description: "Traditional herbal medicine meets modern wellness.",
    images: ["https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2c836064-519a-4426-a65c-e23fd28e400e/id-preview-01a3ae3e--143744e5-de94-4d8b-b68c-8c4663aa4e2f.lovable.app-1783947107581.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sansFont.variable} ${displayFont.variable}`}>
      <body className="antialiased flex min-h-screen flex-col">
        <AppProvider>
          {/* Layout elements like SiteHeader & SiteFooter stay here */}
          <HeaderLayout>
          <main className="flex-1">
            {children}
          </main>
          </HeaderLayout>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}