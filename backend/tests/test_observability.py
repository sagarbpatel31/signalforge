import json
import logging
import re

from fastapi.testclient import TestClient

import main
from app.observability import scrub_sentry_event


async def _explode_for_test():
    raise RuntimeError("private implementation detail")


main.app.add_api_route("/__test__/error", _explode_for_test, methods=["GET"])


def test_health_is_safe_and_correlated(monkeypatch):
    monkeypatch.delenv("UPSTASH_REDIS_REST_URL", raising=False)
    monkeypatch.delenv("UPSTASH_REDIS_REST_TOKEN", raising=False)
    monkeypatch.setattr("app.ingestion.sources.read_cache", lambda name: None)
    response = TestClient(main.app).get(
        "/health", headers={"X-Request-ID": "health-check-1"}
    )

    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == "health-check-1"
    assert response.json() == {
        "status": "ok",
        "service": "signalforge-api",
        "version": "0.3.0",
        "storage": "file",
        "feeds": {
            "last_refresh": None,
            "source_mode": "fallback",
            "counts": {},
        },
    }
    assert "redis_url_prefix" not in response.text


def test_request_log_omits_query_strings(caplog, monkeypatch):
    monkeypatch.setattr("app.ingestion.sources.read_cache", lambda name: None)
    with caplog.at_level(logging.INFO, logger="signalforge.request"):
        response = TestClient(main.app).get("/health?token=do-not-log")

    request_id_value = response.headers["X-Request-ID"]
    assert re.fullmatch(r"[0-9a-f]{32}", request_id_value)
    request_records = [
        record
        for record in caplog.records
        if record.name == "signalforge.request"
    ]
    payload = json.loads(request_records[-1].message)
    assert payload["path"] == "/health"
    assert payload["request_id"] == request_id_value
    assert "do-not-log" not in caplog.text


def test_sentry_scrubber_removes_user_and_request_secrets():
    event = {
        "user": {"email": "private@example.com"},
        "request": {
            "url": "https://signalforge.example/profile?token=secret",
            "headers": {"Authorization": "Bearer secret"},
            "cookies": {"sf_session": "secret"},
            "data": {"name": "Private"},
        },
    }

    scrubbed = scrub_sentry_event(event)
    assert "user" not in scrubbed
    assert scrubbed["request"] == {"url": "https://signalforge.example/profile"}


def test_unhandled_error_returns_only_a_request_reference(caplog):
    with caplog.at_level(logging.ERROR, logger="signalforge.request"):
        response = TestClient(main.app, raise_server_exceptions=False).get(
            "/__test__/error",
            headers={"X-Request-ID": "failed-request-1"},
        )

    assert response.status_code == 500
    assert response.headers["X-Request-ID"] == "failed-request-1"
    assert response.json() == {
        "detail": "Internal server error",
        "request_id": "failed-request-1",
    }
    assert "private implementation detail" not in caplog.text
