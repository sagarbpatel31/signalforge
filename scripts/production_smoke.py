#!/usr/bin/env python3
"""Minimal deployed-service smoke check for scheduled CI."""
import json
import os
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen


def _fetch(url: str, attempts: int = 3) -> tuple[int, bytes]:
    last_error: Exception | None = None
    for attempt in range(attempts):
        try:
            request = Request(url, headers={"User-Agent": "SignalForge-Smoke/1.0"})
            with urlopen(request, timeout=20) as response:
                return response.status, response.read()
        except (HTTPError, URLError, TimeoutError) as exc:
            last_error = exc
            if attempt < attempts - 1:
                time.sleep(2 ** attempt)
    raise RuntimeError(f"Smoke request failed for {url}: {type(last_error).__name__}")


def main() -> int:
    frontend = os.environ.get("SIGNALFORGE_FRONTEND_URL", "").rstrip("/")
    api = os.environ.get("SIGNALFORGE_API_URL", "").rstrip("/")
    if not frontend or not api:
        print("SIGNALFORGE_FRONTEND_URL and SIGNALFORGE_API_URL are required", file=sys.stderr)
        return 2

    api_status, api_body = _fetch(urljoin(f"{api}/", "health"))
    health = json.loads(api_body)
    if api_status != 200 or health.get("status") != "ok":
        raise RuntimeError("API health response was not healthy")
    if not isinstance(health.get("feeds"), dict):
        raise RuntimeError("API health response is missing feed status")

    frontend_status, frontend_body = _fetch(urljoin(f"{frontend}/", "sign-in"))
    if frontend_status != 200 or b"SignalForge" not in frontend_body:
        raise RuntimeError("Frontend sign-in surface did not render SignalForge")

    print(
        f"Smoke passed: frontend={frontend_status}, api={api_status}, "
        f"feed_mode={health['feeds'].get('source_mode', 'unknown')}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
