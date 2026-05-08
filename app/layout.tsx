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
  variable: "--font-family-courier",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lechairdepoule.fr"),
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
          "dark grid h-dvh min-h-full grid-cols-1 grid-rows-[auto_1fr_auto] justify-items-center overflow-x-hidden portrait:w-dvw"
        )}
      >
        <RandomBackground assets={assets} />
        <Header />
        <main className="no-scrollbar relative grid min-h-full w-full grid-cols-1 grid-rows-1 portrait:max-w-dvw">
          <div className="relative mx-auto grid w-full max-w-2xl grid-cols-1 grid-rows-1 overflow-y-scroll bg-black">
            {children}
          </div>
        </main>
        <Footer />
      </body>
      <Analytics />
    </html>
  );
}
