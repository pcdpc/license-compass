import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "License Compass | NP License Tracker",
  description: "Track your APRN/RN licenses, DEA status, and CEUs across all states.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
