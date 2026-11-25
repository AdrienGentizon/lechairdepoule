import { ErrorKeys, Locale } from "../types";
import dictionaries from "./dictionaries/errors";

export function toErrorMessage(
  key: (string & {}) | ErrorKeys,
  locale: Locale = "fr",
) {
  return dictionaries[locale][key as ErrorKeys] ?? key;
}
