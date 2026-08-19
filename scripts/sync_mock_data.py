from __future__ import annotations

import argparse
from datetime import date
import json
from pathlib import Path
import re
import sys
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = ROOT / "backend"
FRONTEND_FILE = ROOT / "frontend" / "src" / "lib" / "mock-data.ts"

sys.path.insert(0, str(BACKEND_ROOT))

from app import mock_data  # noqa: E402


def dump_models(items):
    return [item.model_dump() if hasattr(item, "model_dump") else item for item in items]


def to_ts(name: str, value, ts_type: str | None = None) -> str:
    type_part = f": {ts_type}" if ts_type else ""
    return f"export const {name}{type_part} = {json.dumps(value, indent=2, ensure_ascii=False)};\n"


def _label(item) -> str:
    return (
        getattr(item, "title", "")
        or getattr(item, "name", "")
        or getattr(item, "company", "")
        or "<unnamed>"
    )


def _normalized(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def _datasets():
    return (
        ("opportunities", mock_data.OPPORTUNITIES),
        ("startups", mock_data.STARTUPS),
        ("roles", mock_data.ROLES),
        ("papers", mock_data.PAPERS),
    )


def validate_curated_content(max_age_days: int | None = None) -> list[str]:
    errors: list[str] = []

    try:
        snapshot_date = date.fromisoformat(mock_data.CURATED_SNAPSHOT_DATE)
        if snapshot_date > date.today():
            errors.append("CURATED_SNAPSHOT_DATE is in the future")
        elif max_age_days is not None and (date.today() - snapshot_date).days > max_age_days:
            errors.append(
                f"CURATED_SNAPSHOT_DATE is {(date.today() - snapshot_date).days} days old "
                f"(limit: {max_age_days})"
            )
    except (TypeError, ValueError):
        errors.append("CURATED_SNAPSHOT_DATE must be an ISO date")

    for dataset_name, items in _datasets():
        seen: set[str] = set()
        for item in items:
            label = _label(item)
            identity = _normalized(label)
            if identity in seen:
                errors.append(f"{dataset_name}/{label}: duplicate curated identity")
            seen.add(identity)

            raw_date = getattr(item, "last_verified", "")
            try:
                verified = date.fromisoformat(raw_date)
                if verified > date.today():
                    errors.append(f"{dataset_name}/{label}: last_verified is in the future")
                elif max_age_days is not None and (date.today() - verified).days > max_age_days:
                    errors.append(
                        f"{dataset_name}/{label}: last_verified is "
                        f"{(date.today() - verified).days} days old (limit: {max_age_days})"
                    )
            except (TypeError, ValueError):
                errors.append(f"{dataset_name}/{label}: last_verified must be an ISO date")

            sources = getattr(item, "sources", [])
            if not sources:
                errors.append(f"{dataset_name}/{label}: at least one provenance source is required")
            for source in sources:
                parsed = urlparse(source.url)
                if parsed.scheme != "https" or not parsed.netloc:
                    errors.append(f"{dataset_name}/{label}: invalid HTTPS source {source.url!r}")
                if not source.label.strip():
                    errors.append(f"{dataset_name}/{label}: source label is required")

            if dataset_name in {"opportunities", "startups"}:
                fact = getattr(item, "sourced_fact", "").strip()
                take = getattr(item, "editorial_take", "").strip()
                if not fact or not take:
                    errors.append(f"{dataset_name}/{label}: fact and editorial take are required")
                elif _normalized(fact) == _normalized(take):
                    errors.append(f"{dataset_name}/{label}: fact and editorial take must differ")

    expected_stats = {
        "Signals Tracked": len(mock_data.SIGNALS),
        "Opportunities": len(mock_data.OPPORTUNITIES),
        "Startups Flagged": len(mock_data.STARTUPS),
        "Hiring Signals": len(mock_data.ROLES),
        "Research Papers": len(mock_data.PAPERS),
    }
    actual_stats = {stat.label: stat.value for stat in mock_data.STATS}
    for label, expected in expected_stats.items():
        try:
            actual = int(str(actual_stats.get(label, "")).replace(",", ""))
        except ValueError:
            actual = -1
        if actual != expected:
            errors.append(f"stats/{label}: expected {expected}, found {actual_stats.get(label)!r}")

    for index, post in enumerate(mock_data.POSTS, start=1):
        if len(post.text) > 280:
            errors.append(f"posts/{index}: text is {len(post.text)} characters (limit: 280)")
        if not post.source_ref.strip():
            errors.append(f"posts/{index}: source_ref is required")

    return errors


def build_staleness_report(max_age_days: int) -> str:
    rows = []
    stale_count = 0
    for dataset_name, items in _datasets():
        for item in items:
            raw_date = getattr(item, "last_verified", "")
            try:
                age = (date.today() - date.fromisoformat(raw_date)).days
                status = "STALE" if age > max_age_days else "current"
                stale_count += int(status == "STALE")
            except (TypeError, ValueError):
                age = -1
                status = "INVALID"
                stale_count += 1
            rows.append(
                f"| {dataset_name} | {_label(item)} | {raw_date or '-'} | "
                f"{age if age >= 0 else '-'} | {status} |"
            )

    state = "ACTION REQUIRED" if stale_count else "CURRENT"
    return "\n".join([
        "# SignalForge curated-content freshness",
        "",
        f"- Report date: `{date.today().isoformat()}`",
        f"- Maximum age: `{max_age_days} days`",
        f"- Status: **{state}**",
        f"- Stale or invalid cards: `{stale_count}`",
        "",
        "| Dataset | Card | Last verified | Age (days) | Status |",
        "| --- | --- | --- | ---: | --- |",
        *rows,
        "",
    ])


def build_content() -> str:
    return f"""import type {{
  Signal, Stat, Opportunity, Startup, Role,
  Paper, Post, Task, ConvictionBet,
}} from "./types";

// Generated by scripts/sync_mock_data.py from backend/app/mock_data.py.
// Edit the backend source of truth, then rerun:
//   backend/.venv/bin/python scripts/sync_mock_data.py

{to_ts("curatedSnapshotDate", mock_data.CURATED_SNAPSHOT_DATE).rstrip()}

{to_ts("signals", dump_models(mock_data.SIGNALS), "Signal[]").rstrip()}

{to_ts("marketPulse", mock_data.MARKET_PULSE).rstrip()}

{to_ts("stats", dump_models(mock_data.STATS), "Stat[]").rstrip()}

{to_ts("opportunities", dump_models(mock_data.OPPORTUNITIES), "Opportunity[]").rstrip()}

{to_ts("startups", dump_models(mock_data.STARTUPS), "Startup[]").rstrip()}

{to_ts("roles", dump_models(mock_data.ROLES), "Role[]").rstrip()}

{to_ts("papers", dump_models(mock_data.PAPERS), "Paper[]").rstrip()}

{to_ts("posts", dump_models(mock_data.POSTS), "Post[]").rstrip()}

{to_ts("tasks", dump_models(mock_data.TASKS), "Task[]").rstrip()}

{to_ts("weeklyWins", mock_data.WEEKLY_WINS).rstrip()}

{to_ts("weeklyGaps", mock_data.WEEKLY_GAPS).rstrip()}

{to_ts("convictionBets", dump_models(mock_data.CONVICTION_BETS), "ConvictionBet[]").rstrip()}

{to_ts("nextWeekFocus", mock_data.NEXT_WEEK_FOCUS).rstrip()}
""" + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate and sync curated fallback data.")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Validate content and fail if the generated frontend fallback is out of sync.",
    )
    parser.add_argument(
        "--max-age-days",
        type=int,
        default=None,
        help="Fail when any curated card was verified more than this many days ago.",
    )
    parser.add_argument(
        "--report-file",
        type=Path,
        help="Write a Markdown freshness report (defaults to a 14-day threshold).",
    )
    args = parser.parse_args()

    if args.max_age_days is not None and args.max_age_days < 0:
        parser.error("--max-age-days must be zero or greater")

    report_age = args.max_age_days if args.max_age_days is not None else 14
    if args.report_file:
        args.report_file.parent.mkdir(parents=True, exist_ok=True)
        args.report_file.write_text(build_staleness_report(report_age), encoding="utf-8")
        print(f"Wrote {args.report_file}")

    errors = validate_curated_content(args.max_age_days)
    if errors:
        print("Curated content validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    content = build_content()
    if args.check:
        existing = FRONTEND_FILE.read_text(encoding="utf-8") if FRONTEND_FILE.exists() else ""
        if existing != content:
            print(
                "Frontend fallback is out of sync. Run: "
                "backend/.venv/bin/python scripts/sync_mock_data.py",
                file=sys.stderr,
            )
            return 1
        print("Curated content is valid and frontend fallback is synchronized.")
        return 0

    FRONTEND_FILE.write_text(content, encoding="utf-8")
    print(f"Wrote {FRONTEND_FILE}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
