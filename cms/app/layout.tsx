import type { Metadata } from "next";
import { Courier_Prime, Manrope } from "next/font/google";

import dictionaries from "@cdp/lib/i18n/dictionaries/pages";

import ReactQueryProvider from "@/components/contexts/ReactQueryProvider";
import LocaleProvider from "@/components/i18n/LocaleProvider";
import Header from "@/components/layout/Header/Header";
import Main from "@/components/layout/Main";
import { getLocale, t } from "@/lib/i18n";

import "./globals.css";

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-family-body",
});

const courier = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-family-courier",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lechairdepoule.fr"),
  title: "Orgas - Le Chair de poule",
  description: "Créez et partagez vos événements avec les fins connaisseurs.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const dictionary = await t(dictionaries);

  return (
    <html lang={locale}>
      <body
        className={`${body.variable} ${courier.variable} dark overflow-x-hidden antialiased`}
      >
        <div className="relative isolate grid h-dvh grid-cols-1 grid-rows-[auto_1fr] justify-items-center portrait:w-dvw">
          <LocaleProvider locale={locale}>
            <ReactQueryProvider>
              <a
                href={`#${Main.ID}`}
                className="bg-foreground text-background sr-only absolute left-2 top-2 focus:not-sr-only focus:absolute focus:px-2"
              >
                {dictionary.root_skip_content}
              </a>
              <Header />
              {children}
            </ReactQueryProvider>
          </LocaleProvider>
        </div>
      </body>
    </html>
  );
}
