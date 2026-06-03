// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://91ef7a2b5a550f7da751c3764c7f0aec@o4511223218700288.ingest.de.sentry.io/4511223220600912",
  tracesSampleRate: 0,
  sendDefaultPii: true,
  integrations: [
    Sentry.feedbackIntegration({
      colorScheme: "light",
      triggerLabel: "",
      triggerAriaLabel: "Signaler un problème",
      formTitle: "Signaler un problème",
      submitButtonLabel: "Envoyer",
      cancelButtonLabel: "Annuler",
      nameLabel: "Nom",
      namePlaceholder: "Votre nom",
      emailLabel: "Email",
      emailPlaceholder: "votre@email.com",
      messageLabel: "Description",
      messagePlaceholder: "Décrivez le problème rencontré…",
      successMessageText: "Merci pour votre retour !",
    }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
