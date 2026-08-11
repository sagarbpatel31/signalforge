import json
import logging
import os
import re
import uuid
from typing import Any


REQUEST_LOGGER = logging.getLogger("signalforge.request")
_REQUEST_ID_RE = re.compile(r"^[A-Za-z0-9._-]{1,128}$")


def request_id(value: str | None) -> str:
    if value and _REQUEST_ID_RE.fullmatch(value):
        return value
    return uuid.uuid4().hex


def request_log(
    *, request_id_value: str, method: str, path: str, status: int, duration_ms: float
) -> str:
    return json.dumps(
        {
            "event": "http_request",
            "request_id": request_id_value,
            "method": method,
            "path": path,
            "status": status,
            "duration_ms": round(duration_ms, 2),
        },
        separators=(",", ":"),
        sort_keys=True,
    )


def _sample_rate(name: str, fallback: float) -> float:
    try:
        return min(1.0, max(0.0, float(os.environ.get(name, fallback))))
    except (TypeError, ValueError):
        return fallback


def scrub_sentry_event(event: dict[str, Any], _hint: Any = None) -> dict[str, Any]:
    event.pop("user", None)
    request = event.get("request")
    if isinstance(request, dict):
        request.pop("cookies", None)
        request.pop("data", None)
        request.pop("headers", None)
        url = request.get("url")
        if isinstance(url, str):
            request["url"] = url.split("?", 1)[0]
    return event


def init_sentry() -> bool:
    dsn = os.environ.get("SENTRY_DSN", "").strip()
    if not dsn:
        return False

    import sentry_sdk

    sentry_sdk.init(
        dsn=dsn,
        environment=os.environ.get("SENTRY_ENVIRONMENT") or os.environ.get("ENV"),
        send_default_pii=False,
        max_request_body_size="never",
        traces_sample_rate=_sample_rate("SENTRY_TRACES_SAMPLE_RATE", 0.05),
        before_send=scrub_sentry_event,
    )
    return True
