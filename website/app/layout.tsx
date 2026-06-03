import { Analytics } from "@vercel/analytics/react";

import type { Metadata } from "next";
import { Courier_Prime, Manrope } from "next/font/google";

import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import Main from "@/components/Main";
import RandomBackground from "@/components/RandomBackground/RandomBackground";
import { cn } from "@/lib/utils";
import getRandomBackground from "@/queries/getRandomBackground";

import "./globals.css";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-family-body",
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black"
        >
          Aller au contenu principal
        </a>
        <RandomBackground assets={assets} />
        <Header />
        <Main>{children}</Main>
        <Footer />
      </body>
      <Analytics />
    </html>
  );
}
