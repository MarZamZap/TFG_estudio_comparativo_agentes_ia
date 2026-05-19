import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "react-hot-toast";
import { verifySession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sistema Óptica",
  description: "Gestión Óptica - Next + Prisma",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuth } = await verifySession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {isAuth ? (
          <TooltipProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="w-full min-h-screen flex flex-col bg-slate-50 min-w-0">
                <div className="p-4 flex items-center bg-white border-b shadow-sm sticky top-0 z-10 w-full">
                  <SidebarTrigger className="mr-4" />
                  <h1 className="text-xl font-semibold opacity-80">Óptica TFG</h1>
                </div>
                <div className="p-4 flex-1 min-w-0">
                  {children}
                </div>
              </main>
            </SidebarProvider>
            <Toaster position="top-right" />
          </TooltipProvider>
        ) : (
          <main className="w-full min-h-screen flex flex-col bg-slate-50">
            {children}
            <Toaster position="top-right" />
          </main>
        )}
      </body>
    </html>
  );
}
