import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Footer } from "@/components/layout/Footer/Footer";
import "./globals.css";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { AuthProvider } from "@/contexts/AuthContext";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KindaGigz",
  description: "Find, converse and hire top-tier local professionals and service providers in minutes. From specialized services to everyday tasks, get it done right with KindaGigz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${jakarta.variable} ${inter.variable} antialiased bg-primary`}
      >  
        <AuthProvider>
          {children}
          <ToastProvider />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
