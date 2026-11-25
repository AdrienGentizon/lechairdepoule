import { ErrorKeys, Locale } from "../../types";

const en = {
  unknown_error: "unknown error",
  server_error: "server error",
  bad_request: "bad request",
  not_found: "not found",
  unauthorized: "unauthorized",
  upsert_user_failed: "cannot create user",
  email_not_sent: "unable to send the code right now, please try again later",
  file_too_large: "file too large",
  unsupported_file_type: "unsupported file type",
  upload_failed: "unable to upload the file",
  INVALID_OTP: "invalid verification code",
  OTP_EXPIRED: "verification code expired, request a new code",
  TOO_MANY_ATTEMPTS: "too many attempts, request a new code",
  UNKNOWN_AUTH_ERROR: "unknown authentification error",
} satisfies Record<ErrorKeys, string>;

const fr = {
  unknown_error: "erreur inconnue",
  server_error: "erreur serveur",
  bad_request: "requête non valide",
  not_found: "ressource introuvable",
  unauthorized: "non autorisé",
  upsert_user_failed: "impossible de créer l'utilisateur",
  email_not_sent:
    "impossible d'envoyer le code pour le moment, réessayez plus tard",
  file_too_large: "fichier trop volumineux",
  unsupported_file_type: "type de fichier non supporté",
  upload_failed: "impossible d'envoyer le fichier",
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
