"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" data-theme="dark">
      <body>
        <main className="recovery-shell">
          <section className="recovery-card recovery-card-critical">
            <span className="recovery-kicker">TERMINAL OFFLINE</span>
            <h1>SignalForge could not start this view.</h1>
            <p>
              Retry the application. If the problem repeats, use the reference
              below to locate the failed request in the error report.
            </p>
            {error.digest ? (
              <code className="recovery-reference">Reference {error.digest}</code>
            ) : null}
            <div className="recovery-actions">
              <button type="button" onClick={reset}>Restart view</button>
              <Link href="/">Dashboard</Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
