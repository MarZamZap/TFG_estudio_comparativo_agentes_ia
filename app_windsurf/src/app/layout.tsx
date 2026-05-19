import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ÓpticaApp - Gestión Óptica Profesional",
  description: "Sistema de gestión integral para ópticas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        <AuthSessionProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
