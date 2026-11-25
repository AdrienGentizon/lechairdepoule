import { ErrorKeys, Locale } from "../../types";

const en = {
  server_error: "server error",
  bad_request: "bad request",
  not_found: "not found",
  unauthorized: "unauthorized",
  upsert_user_failed: "cannot create user",
  email_not_sent: "unable to send the code right now, please try again later",
  INVALID_OTP: "invalid verification code",
  OTP_EXPIRED: "verification code expired, request a new code",
  TOO_MANY_ATTEMPTS: "too many attempts, request a new code",
  UNKNOWN_AUTH_ERROR: "unknown authentification error",
} satisfies Record<ErrorKeys, string>;

const fr = {
  server_error: "erreur serveur",
  bad_request: "requête non valide",
  not_found: "ressource introuvable",
  unauthorized: "non autorisé",
  upsert_user_failed: "impossible de créer l'utilisateur",
  email_not_sent:
    "impossible d'envoyer le code pour le moment, réessayez plus tard",
  INVALID_OTP: "code de vérification non valide",
  OTP_EXPIRED: "code de vérification expiré, demandez un nouveau code",
  TOO_MANY_ATTEMPTS: "trop de tentatives, demandez un nouveau code",
  UNKNOWN_AUTH_ERROR: "erreur d'authentification inconnue",
} satisfies typeof en;

const dictionaries = { en, fr } satisfies Record<
  Locale,
  Record<ErrorKeys, string>
>;

export default dictionaries;
