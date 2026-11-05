import * as Sentry from "@sentry/browser";

import {
  APP_VERSION,
  SENTRY_DSN,
  TELEMETRY_ENV,
  telemetryAllowed,
} from "./config";
import { scrubEvent, scrubText } from "./scrub";

let started = false;

export function initErrorMonitoring() {
  if (started || !SENTRY_DSN || !telemetryAllowed()) return;

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: TELEMETRY_ENV,
      release: `mapleroute@${APP_VERSION}`,
      sendDefaultPii: false,
      tracesSampleRate: 0,
      integrations: (defaults) =>
        defaults.filter(
          (integration) => integration.name !== "BrowserSession",
        ),
      beforeSend: scrubEvent,
    });
    started = true;
  } catch {
    started = false;
  }
}

export function captureError(error: unknown, componentStack?: string) {
  if (!SENTRY_DSN || !telemetryAllowed()) return;

  initErrorMonitoring();
  if (!started) return;

  try {
    Sentry.captureException(
      error,
      componentStack
        ? {
            contexts: {
              react: { componentStack: scrubText(componentStack) },
            },
          }
        : undefined,
    );
  } catch {
    // Error reporting must never break the app.
  }
}
