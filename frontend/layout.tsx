import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./Utils/Sidebar";
import Header from "./Utils/Header";
import ClientLayoutWrapper from "./Utils/ClientLayoutWrapper";
import AuthGuard from "./Utils/AuthGuard";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "POS System",
  description: "Point of Sale Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <AuthGuard>
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </AuthGuard>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              zIndex: 9999, // beats your sidebar z-50
            },
          }}
        />
      </body>
    </html>
  );
}
