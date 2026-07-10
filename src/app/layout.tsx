import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

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
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
