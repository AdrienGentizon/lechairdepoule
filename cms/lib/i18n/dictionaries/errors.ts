import { Dictionaries } from "@/lib/i18n/types";
import type { ErrorKeys } from "@/lib/types";

const en = {
  server_error: "Something went wrong, please try again",
  unauthorized: "Access denied",
  bad_request: "Invalid request",
  not_found: "Not found",
  invalid_otp: "Invalid code",
  expired_otp: "Code expired, please request a new one",
};

const fr = {
  server_error: "Une erreur est survenue, veuillez réessayer",
  unauthorized: "Accès refusé",
  bad_request: "Requête invalide",
  not_found: "Introuvable",
  invalid_otp: "Code invalide",
  expired_otp: "Code expiré, veuillez en demander un nouveau",
} satisfies typeof en;

const errorDictionaries: Dictionaries<Record<ErrorKeys, string>> = { en, fr };

export default errorDictionaries;
