export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/user-service";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CosmicSound | Tu brújula en el universo sonoro",
  description: "Descubre música que trasciende el espacio y el tiempo.",
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
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..0" />
      </head>
      <body className={`${inter.className} antialiased selection:bg-cosmic-accent/30`}>
        <Navbar user={user} />
        {children}
      </body>
    </html>
  );
}

