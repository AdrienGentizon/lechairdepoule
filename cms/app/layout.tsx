import type { Metadata } from "next";
import { Courier_Prime, Manrope } from "next/font/google";

import LocaleProvider from "@/components/i18n/LocaleProvider";
import { getLocale, t } from "@/lib/i18n";
import dictionaries from "@/lib/i18n/dictionaries/rootLayout";

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
      <body className="grid h-dvh min-h-full grid-cols-1 justify-items-center overflow-x-hidden bg-background portrait:w-dvw">
        <LocaleProvider locale={locale}>
          <a
            href="#main"
            className="sr-only absolute top-2 left-2 bg-foreground text-background focus:not-sr-only focus:absolute focus:px-2"
          >
            {dictionary.skip_content}
          </a>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
