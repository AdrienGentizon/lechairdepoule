import { headers } from "next/headers";

import { Dictionaries, SUPPORTED_LOCALES } from "@/lib/i18n/types";

export async function getLocale() {
  const language = (await headers()).get("accept-language")?.split(",").at(0);

  return (
    SUPPORTED_LOCALES.find((locale) => locale === language?.slice(0, 2)) ?? "en"
  );
}

export async function t<T>(dictionaries: Dictionaries<T>) {
  return dictionaries[await getLocale()];
}
