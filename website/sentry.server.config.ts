// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://91ef7a2b5a550f7da751c3764c7f0aec@o4511223218700288.ingest.de.sentry.io/4511223220600912",
  tracesSampleRate: 0,
  sendDefaultPii: true,
});
