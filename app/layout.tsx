import type { Metadata } from "next";
import { Courier_Prime, Quicksand } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";

const sans = Quicksand({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-courier",
});

export const metadata: Metadata = {
  title: "Le Chair de poule",
  description: "Le site web du bar Le Chair de Poule et du Peine perdue aussi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={cn(
          `${sans.variable} ${mono.variable} antialiased`,
          "dark z-10 grid h-[100dvh] min-h-full grid-cols-1 grid-rows-[min-content_1fr_min-content] justify-items-center overflow-x-hidden",
        )}
      >
        {children}
      </body>
      <Analytics />
    </html>
  );
}
