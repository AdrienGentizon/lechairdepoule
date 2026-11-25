import { Dictionaries } from "@cdp/lib/types";

import { useLocale } from "@/components/i18n/LocaleProvider";

export default function useT<T>(dictionaries: Dictionaries<T>) {
  return dictionaries[useLocale()];
}
