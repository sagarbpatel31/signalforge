import Link from "next/link";

export default function NotFound() {
  return (
    <main className="recovery-shell">
      <section className="recovery-card">
        <span className="recovery-kicker">SIGNAL NOT FOUND</span>
        <h1>This route is outside the watchlist.</h1>
        <p>
          The page may have moved, or the signal may no longer be tracked.
          Return to the dashboard to continue.
        </p>
        <div className="recovery-actions">
          <Link href="/">Back to dashboard</Link>
        </div>
      </section>
    </main>
  );
}
