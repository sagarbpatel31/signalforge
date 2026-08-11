"use client";

import {
  Analytics,
  type BeforeSendEvent,
} from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const PRIVATE_ROUTES = ["/sign-in", "/sign-up", "/onboarding", "/profile"];

function safeUrl(value: string): string | null {
  try {
    const url = new URL(value, window.location.origin);
    if (PRIVATE_ROUTES.some((route) => url.pathname.startsWith(route))) {
      return null;
    }
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function filterAnalytics(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = safeUrl(event.url);
  return url ? { ...event, url } : null;
}

export function Telemetry() {
  return (
    <>
      <Analytics debug={false} beforeSend={filterAnalytics} />
      <SpeedInsights
        debug={false}
        sampleRate={0.25}
        beforeSend={(event) => {
          const url = safeUrl(event.url);
          return url ? { ...event, url } : null;
        }}
      />
    </>
  );
}
