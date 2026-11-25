const en = {
  email_label: "Email",
  continue: "Continue",
  otp_label: "Verification code",
  code_sent_to: "We sent a code to",
  wrong_email_hint: "Oops, wrong email?",
  sign_in: "Sign in",
  sign_out: "Sign out",
  resend_code: "Resend code",
};

const fr = {
  email_label: "Email",
  continue: "Continuer",
  otp_label: "Code de vérification",
  code_sent_to: "Le code a été envoyé à",
  wrong_email_hint: "Oups, changer l'email ?",
  sign_in: "Se connecter",
  sign_out: "Se déconnecter",
  resend_code: "Renvoyer un code",
} satisfies typeof en;

const dictionaries = { en, fr };

export default dictionaries;
