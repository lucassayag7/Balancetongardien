import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Balance ton gardien",
  description:
    "Signalez, documentez et agissez contre les manquements de votre gardien d'immeuble.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BTG",
  },
  openGraph: {
    title: "Balance ton gardien",
    description: "La plateforme de signalement citoyenne pour les résidents.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#E8400C",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-surface antialiased">
        <div className="relative min-h-screen max-w-md mx-auto bg-surface shadow-xl">
          {children}
        </div>
      </body>
    </html>
  );
}
