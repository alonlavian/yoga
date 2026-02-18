import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yoga Studio",
  description: "Student management for yoga instructors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-hidden p-8 relative flex flex-col">
            <div className="absolute inset-0 bg-[url('/yoga-bg.jpg')] bg-no-repeat bg-center bg-cover opacity-[0.12] pointer-events-none" />
            <div className="relative flex-1 min-h-0 flex flex-col">{children}</div>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
