type ScrubbableEvent = {
  user?: unknown;
  request?: Record<string, unknown>;
};

type ScrubbableBreadcrumb = {
  data?: Record<string, unknown>;
};

export function sampleRate(value: string | undefined, fallback = 0.05): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : fallback;
}

function stripQuery(value: unknown): unknown {
  return typeof value === "string" ? value.split("?", 1)[0] : value;
}

export function scrubSentryEvent<T>(event: T): T {
  const mutable = event as ScrubbableEvent;
  delete mutable.user;
  if (mutable.request) {
    delete mutable.request.cookies;
    delete mutable.request.data;
    delete mutable.request.headers;
    mutable.request.url = stripQuery(mutable.request.url);
  }
  return event;
}

export function scrubSentryBreadcrumb<T>(breadcrumb: T): T {
  const mutable = breadcrumb as ScrubbableBreadcrumb;
  if (mutable.data) {
    for (const key of ["url", "from", "to"]) {
      mutable.data[key] = stripQuery(mutable.data[key]);
    }
  }
  return breadcrumb;
}
