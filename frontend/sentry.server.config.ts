import * as Sentry from "@sentry/nextjs";

import {
  sampleRate,
  scrubSentryBreadcrumb,
  scrubSentryEvent,
} from "./src/lib/sentry-config";

const dsn = (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)?.trim();

if (dsn) {
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    tracesSampleRate: sampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE),
    beforeSend: (event) => scrubSentryEvent(event),
    beforeBreadcrumb: (breadcrumb) => scrubSentryBreadcrumb(breadcrumb),
  });
}
