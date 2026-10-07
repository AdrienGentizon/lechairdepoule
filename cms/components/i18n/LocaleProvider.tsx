"use client";

import { createContext, useContext } from "react";

import { Locale } from "@/lib/i18n/types";

const LocaleContext = createContext<Locale>("en");

export function useLocale() {
  return useContext(LocaleContext);
}

export default function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}
