export type AuthErrorKeys =
  "INVALID_OTP" | "OTP_EXPIRED" | "TOO_MANY_ATTEMPTS" | "UNKNOWN_AUTH_ERROR";

export type ErrorKeys =
  | "server_error"
  | "bad_request"
  | "not_found"
  | "upsert_user_failed"
  | "email_not_sent"
  | AuthErrorKeys;

type SupportedLocales = "fr" | "en";

const dictionary: Record<SupportedLocales, Record<ErrorKeys, string>> = {
  en: {
    server_error: "server error",
    bad_request: "bad request",
    not_found: "not found",
    upsert_user_failed: "cannot create user",
    email_not_sent: "unable to send the code right now, please try again later",
    INVALID_OTP: "invalid verification code",
    OTP_EXPIRED: "verification code expired, request a new code",
    TOO_MANY_ATTEMPTS: "too many attempts, request a new code",
    UNKNOWN_AUTH_ERROR: "unknown authentification error",
  },
  fr: {
    server_error: "erreur serveur",
    bad_request: "requête non valide",
    not_found: "ressource introuvable",
    upsert_user_failed: "impossible de créer l'utilisateur",
    email_not_sent:
      "impossible d'envoyer le code pour le moment, réessayez plus tard",
    INVALID_OTP: "code de vérification non valide",
    OTP_EXPIRED: "code de vérification expiré, demandez un nouveau code",
    TOO_MANY_ATTEMPTS: "trop de tentatives, demandez un nouveau code",
    UNKNOWN_AUTH_ERROR: "erreur d'authentification inconnue",
  },
};

export function toErrorMessage(
  key: (string & {}) | ErrorKeys,
  locale: SupportedLocales = "fr",
) {
  return dictionary[locale][key as ErrorKeys] ?? key;
}
