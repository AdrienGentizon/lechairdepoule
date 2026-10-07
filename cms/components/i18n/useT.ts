import { useLocale } from "@/components/i18n/LocaleProvider";
import { Dictionaries } from "@/lib/i18n/types";

export default function useT<T>(dictionaries: Dictionaries<T>) {
  return dictionaries[useLocale()];
}
