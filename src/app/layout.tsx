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
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.nombre} — Compra inteligente, ahorro real`,
    template: `%s · ${SITE_CONFIG.nombre}`,
  },
  description: SITE_CONFIG.descripcion,
  keywords: [
    "lista de compras",
    "presupuesto compras",
    "ahorro supermercado",
    "app compras",
    "control de gastos",
    "gestión de compra",
    "antbudget",
  ],
  applicationName: SITE_CONFIG.nombre,
  authors: [{ name: SITE_CONFIG.nombre }],
  creator: SITE_CONFIG.nombre,
  publisher: SITE_CONFIG.nombre,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_CONFIG.nombre} — Compra inteligente, ahorro real`,
    description: SITE_CONFIG.descripcion,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.nombre,
    locale: SITE_CONFIG.locale,
    type: "website",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: SITE_CONFIG.nombre,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.nombre} — Compra inteligente, ahorro real`,
    description: SITE_CONFIG.descripcion,
    creator: "@antbudget",
    site: "@antbudget",
    images: ["/icons/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
