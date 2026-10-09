export type AuthErrorKeys =
  "INVALID_OTP" | "OTP_EXPIRED" | "TOO_MANY_ATTEMPTS" | "UNKNOWN_AUTH_ERROR";

export type ErrorKeys =
  | "server_error"
  | "bad_request"
  | "not_found"
  | "upsert_user_failed"
  | AuthErrorKeys;

type SupportedLocales = "fr" | "en";

const dictionary: Record<SupportedLocales, Record<ErrorKeys, string>> = {
  en: {
    server_error: "server error",
    bad_request: "bad request",
    not_found: "not found",
    upsert_user_failed: "cannot create user",
    INVALID_OTP: "invalid verification code",
    OTP_EXPIRED: "verification expired",
    TOO_MANY_ATTEMPTS: "too many attempts",
    UNKNOWN_AUTH_ERROR: "unknown authentification error",
  },
  fr: {
    server_error: "erreur serveur",
    bad_request: "requête non valide",
    not_found: "ressource introuvable",
    upsert_user_failed: "impossible de créer l'utilisateur",
    INVALID_OTP: "code de vérification non valide",
    OTP_EXPIRED: "code de vérification expiré",
    TOO_MANY_ATTEMPTS: "trop de tentatives",
    UNKNOWN_AUTH_ERROR: "erreur d'authentification inconnue",
  },
};

export function toErrorMessage(
  key: (string & {}) | ErrorKeys,
  locale: SupportedLocales = "fr",
) {
  return dictionary[locale][key as ErrorKeys] ?? key;
}
