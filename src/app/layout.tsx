import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css"; // Your Tailwind v4 stylesheet
import HeaderLayout from "@/components/HeaderLayout";
import InstallPrompt from "@/components/InstallPrompt";

// Next.js automatically injects standard Google Fonts into your HTML document optimizations
const sansFont = Inter({ subsets: ["latin"], variable: "--font-sans" });
const displayFont = Fraunces({ subsets: ["latin"], variable: "--font-display" });


export const viewport: Viewport = {
  themeColor: "#025a2b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
// This completely replaces your TanStack head() configuration object
export const metadata: Metadata = {
  title: "Gbemileke Tradomedical Hospital — Holistic Care Rooted in Tradition",
  description: "Traditional herbal medicine meets modern wellness. Maternal care, bone setting, stroke recovery, fertility, and a curated herbal pharmacy.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gbemileke Hospital",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: [
      { url: "/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
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
          {/* Layout elements like SiteHeader & SiteFooter stay here */}
          <HeaderLayout>
          <main className="flex-1">
            {children}
          </main>
          </HeaderLayout>
          <InstallPrompt/>
          <Toaster />
        
      </body>
    </html>
  );
}