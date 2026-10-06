// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://91ef7a2b5a550f7da751c3764c7f0aec@o4511223218700288.ingest.de.sentry.io/4511223220600912",
  tracesSampleRate: 0,
  sendDefaultPii: true,
});
