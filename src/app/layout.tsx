export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getCurrentUserServer as getCurrentUser } from "@/lib/user-service-server";
import CosmicBackground from "@/components/CosmicBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CosmicSound | Tu brújula en el universo sonoro",
    template: "%s | CosmicSound"
  },
  description: "Descubre música que trasciende el espacio y el tiempo. Exploración musical impulsada por IA.",
  applicationName: "CosmicSound",
  keywords: ["música", "IA", "descubrimiento", "streaming", "cosmic", "playlists"],
  authors: [{ name: "CosmicSound Team" }],
  creator: "CosmicSound",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://cosmicsound-wheat.vercel.app/",
    title: "CosmicSound | Tu brújula en el universo sonoro",
    description: "Descubre música que trasciende el espacio y el tiempo.",
    siteName: "CosmicSound",
    images: [
      {
        url: "/og-image.jpg", // We need to make sure this exists or use a placeholder
        width: 1200,
        height: 630,
        alt: "CosmicSound Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CosmicSound | IA Music Discovery",
    description: "Descubre música que trasciende el espacio y el tiempo.",
    creator: "@cosmicsound",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#050510",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error("Failed to load user in RootLayout:", error);
  }

  return (
    <html lang="es" className="dark">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..0&display=swap" />
      </head>
      <body className={`${inter.className} antialiased selection:bg-cosmic-accent/30 bg-[#020205]`}>
        <CosmicBackground />
        <Navbar user={user} />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "CosmicSound",
              "url": "https://cosmicsound-wheat.vercel.app/",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://cosmicsound-wheat.vercel.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </body>
    </html>
  );
}

