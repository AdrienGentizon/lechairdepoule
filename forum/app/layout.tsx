import type { Metadata } from "next";
import { Courier_Prime, Manrope } from "next/font/google";

import ZodTranslations from "@/components/ZodTranslations";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-family-body",
});

const courier = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-family-courier",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://forum.lechairdepoule.fr"),
  title: "Le Chair de poule - Forum",
  description: "Le forum du bar Le Chair de Poule et du Peine perdue aussi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${manrope.variable} ${courier.variable} antialiased`}
    >
      <body
        className={
          "dark grid h-dvh min-h-full grid-cols-1 grid-rows-1 justify-items-center overflow-x-hidden portrait:w-dvw"
        }
      >
        <ZodTranslations />
        {children}
      </body>
    </html>
  );
}
