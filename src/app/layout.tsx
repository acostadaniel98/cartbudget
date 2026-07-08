import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { ServiceWorkerRegister } from "@/components/shared/service-worker-register";
import { DatabaseBootstrap } from "@/components/shared/database-bootstrap";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { BottomNav } from "@/components/shared/bottom-nav";
import { Toaster } from "@/components/ui/sonner";
import { SITE_CONFIG } from "@/config/site";

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.nombre} — Tu compra, bajo control`,
    template: `%s · ${SITE_CONFIG.nombre}`,
  },
  description: SITE_CONFIG.descripcion,
  applicationName: SITE_CONFIG.nombre,
  icons: {
    icon: [
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_CONFIG.nombre,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f5" },
    { media: "(prefers-color-scheme: dark)", color: "#121513" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-SV" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <ThemeProvider>
          <ServiceWorkerRegister />
          <DatabaseBootstrap />
          <OfflineBanner />
          <div className="mx-auto min-h-dvh max-w-md pb-20">{children}</div>
          <BottomNav />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
