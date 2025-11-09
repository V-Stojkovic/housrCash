import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./Providers";
import "./globals.css";
import { Sidebar } from '@/components/app/navigation/sidebar';
import { BottomNav } from '@/components/app/navigation/bottom-nav';
import { Toaster } from 'sonner';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HousrCash",
  description: "Earn rewards everytime you pay a bill",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="flex flex-col md:flex-row min-h-screen bg-background font-sans">
            {/* Sidebar is now part of the global layout */}
            <Sidebar />

            <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto">
              {children}
            </main>

            {/* BottomNav for mobile is now part of the global layout */}
            <BottomNav />
          </div>
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}