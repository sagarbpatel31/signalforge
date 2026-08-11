import * as Sentry from "@sentry/nextjs";

import {
  sampleRate,
  scrubSentryBreadcrumb,
  scrubSentryEvent,
} from "@/lib/sentry-config";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();

if (dsn) {
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    tracesSampleRate: sampleRate(
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE
    ),
    beforeSend: (event) => scrubSentryEvent(event),
    beforeBreadcrumb: (breadcrumb) => scrubSentryBreadcrumb(breadcrumb),
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
