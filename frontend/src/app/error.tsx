"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
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
    <main className="recovery-shell">
      <section className="recovery-card">
        <span className="recovery-kicker">SYSTEM INTERRUPT</span>
        <h1>The signal pipeline hit an error.</h1>
        <p>
          Your saved work is intact. Retry this view, or return to the dashboard
          while the failed request is investigated.
        </p>
        {error.digest ? (
          <code className="recovery-reference">Reference {error.digest}</code>
        ) : null}
        <div className="recovery-actions">
          <button type="button" onClick={reset}>Try again</button>
          <Link href="/">Dashboard</Link>
        </div>
      </section>
    </main>
  );
}
