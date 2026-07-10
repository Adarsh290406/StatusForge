import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "StatusForge",
  description: "Public status page and incident tracker",
};

import { ReticleDev } from "./reticle-dev";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        {children}
        {process.env.NODE_ENV === "development" ? <ReticleDev /> : null}
      </body>
    </html>
  );
}
