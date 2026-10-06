import type { Metadata } from "next";
import { Courier_Prime, Manrope } from "next/font/google";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only absolute top-2 left-2 bg-foreground text-background focus:not-sr-only focus:absolute focus:px-2"
        >
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
