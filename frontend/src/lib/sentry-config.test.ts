import { describe, expect, it } from "vitest";

import {
  sampleRate,
  scrubSentryBreadcrumb,
  scrubSentryEvent,
} from "./sentry-config";

describe("Sentry privacy helpers", () => {
  it("clamps configured trace sampling", () => {
    expect(sampleRate(undefined)).toBe(0.05);
    expect(sampleRate("2")).toBe(1);
    expect(sampleRate("-1")).toBe(0);
    expect(sampleRate("invalid", 0.1)).toBe(0.1);
  });

  it("removes identity and request secrets", () => {
    const event = {
      user: { email: "private@example.com" },
      request: {
        url: "https://signalforge.example/profile?token=secret",
        headers: { Authorization: "Bearer secret" },
        cookies: { sf_session: "secret" },
        data: { name: "Private" },
      },
    };

    expect(scrubSentryEvent(event)).toEqual({
      request: { url: "https://signalforge.example/profile" },
    });
  });

  it("removes query strings from navigation breadcrumbs", () => {
    const breadcrumb = {
      data: {
        from: "/profile?tab=account",
        to: "/?source=private",
      },
    };

    expect(scrubSentryBreadcrumb(breadcrumb)).toEqual({
      data: { from: "/profile", to: "/" },
    });
  });
});
