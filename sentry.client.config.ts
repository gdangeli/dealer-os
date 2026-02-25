import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://d15aa2674a3003c0d423c73cdf33ef7a@o4510944967589888.ingest.de.sentry.io/4510944972308560",
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Session Replay (optional, kann später aktiviert werden)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Nur in Production senden
  enabled: process.env.NODE_ENV === "production",
});
