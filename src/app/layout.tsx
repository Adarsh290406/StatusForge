import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "StatusForge | Live System Health & Incidents",
    template: "%s | StatusForge",
  },
  description: "Monitor live service health, track ongoing incidents, and view historical system performance logs on StatusForge.",
  openGraph: {
    title: "StatusForge | Live System Health & Incidents",
    description: "Monitor live service health, track ongoing incidents, and view historical system performance logs on StatusForge.",
    type: "website",
    url: "https://statusforge.vercel.app",
    siteName: "StatusForge",
  },
  twitter: {
    card: "summary",
    title: "StatusForge | Live System Health",
    description: "Monitor live service health, track ongoing incidents, and view historical system performance logs on StatusForge.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={cn("font-sans antialiased bg-[#f9fafb] dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-150", inter.className)}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
