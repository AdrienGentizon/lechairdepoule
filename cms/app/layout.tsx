import type { Metadata } from "next";
import { Courier_Prime, Manrope } from "next/font/google";

import dictionaries from "@cdp/lib/i18n/dictionaries/pages";

import LocaleProvider from "@/components/i18n/LocaleProvider";
import { getLocale, t } from "@/lib/i18n";

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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const dictionary = await t(dictionaries);

  return (
    <html
      lang={locale}
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="bg-background grid h-dvh min-h-full grid-cols-1 justify-items-center overflow-x-hidden portrait:w-dvw">
        <LocaleProvider locale={locale}>
          <a
            href="#main"
            className="bg-foreground text-background sr-only absolute left-2 top-2 focus:not-sr-only focus:absolute focus:px-2"
          >
            {dictionary.root_skip_content}
          </a>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
