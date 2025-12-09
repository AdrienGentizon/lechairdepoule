import { Analytics } from "@vercel/analytics/react";

import type { Metadata } from "next";
import { Courier_Prime, Quicksand } from "next/font/google";

import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import RandomBackground from "@/components/RandomBackground/RandomBackground";
import { cn } from "@/lib/utils";
import getRandomBackground from "@/queries/getRandomBackground";

import "./globals.css";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const assets = (await getRandomBackground())?.assetsCollection.items ?? [];

  return (
    <html lang="fr">
      <body
        className={cn(
          `${sans.variable} ${mono.variable} antialiased`,
          "dark z-10 grid h-[100dvh] min-h-full grid-cols-1 grid-rows-[1fr_min-content] justify-items-center overflow-hidden"
        )}
      >
        <Header />
        <main className="no-scrollbar grid min-h-full w-full max-w-2xl grid-cols-1 grid-rows-1 [&>*:first-child]:pt-32 sm:[&>*:first-child]:pt-44">
          <div className="mx-auto grid w-full grid-cols-1 grid-rows-1 overflow-y-scroll bg-black">
            {children}
          </div>
          <RandomBackground assets={assets} />
        </main>
        <Footer />
      </body>
      <Analytics />
    </html>
  );
}
