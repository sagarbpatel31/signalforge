#!/usr/bin/env python
"""
Mint a session token from the command line.

Sessions are now opaque and server-signed, so data written under the old
handle-derived keys (profile:sagar-patel, workbench:sagar-patel, …) is no
longer reachable from the browser. This script mints a token and optionally
copies an old key's data onto it, so an existing user keeps their profile
instead of re-onboarding.

    python scripts/mint_session.py                    # fresh session
    python scripts/mint_session.py --adopt sagar-patel

Then, in the browser console on the SignalForge origin:

    localStorage.setItem("sf-session", "<token>");
    document.cookie = "sf_session=<token>; Path=/; Max-Age=31536000; SameSite=Lax";
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(ROOT / "backend" / ".env")

from app.auth import issue_token  # noqa: E402
from app.kv import kv_get, kv_set  # noqa: E402

SCOPES = ("profile", "workbench", "bookmarks")
YEAR = 365 * 86_400


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--adopt",
        metavar="OLD_KEY",
        help='Copy data from the pre-auth key (e.g. "sagar-patel", or "default" '
        "for the unscoped local seed) onto the new session.",
    )
    args = parser.parse_args()

    token = issue_token()
    user_id = token.rpartition(".")[0]

    if args.adopt:
        old = args.adopt.strip()
        for scope in SCOPES:
            source = scope if old == "default" else f"{scope}:{old}"
            data = kv_get(source)
            if data is None:
                print(f"  {scope:<10} nothing at {source!r}, skipped")
                continue
            kv_set(f"{scope}:{user_id}", data, ttl=YEAR)
            print(f"  {scope:<10} copied {source!r} -> {scope}:{user_id}")

    print(f"\nuser_id: {user_id}\ntoken:   {token}\n")
    print("Paste into the browser console on the SignalForge origin:")
    print(f'  localStorage.setItem("sf-session", "{token}");')
    print(
        f'  document.cookie = "sf_session={token}; Path=/; Max-Age=31536000; SameSite=Lax";'
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
