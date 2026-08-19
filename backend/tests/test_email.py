import asyncio

import pytest
from fastapi import HTTPException

from app.routers import email


def test_digest_html_escapes_feed_content_and_blocks_unsafe_urls(monkeypatch):
    caches = {
        "news": [{
            "title": '<script>alert("x")</script>',
            "url": "javascript:alert(1)",
            "source": "News & Co",
        }],
        "papers": [],
        "jobs": [],
    }
    monkeypatch.setattr(
        "app.ingestion.sources.read_cache",
        lambda name: caches.get(name, []),
    )

    rendered = email._render_html(email._build_digest_from_cache())

    assert "<script>" not in rendered
    assert "&lt;script&gt;" in rendered
    assert 'href="#"' in rendered
    assert "News &amp; Co" in rendered


def test_email_provider_error_is_not_exposed(monkeypatch):
    class FailingEmails:
        @staticmethod
        def send(payload):
            raise RuntimeError("secret provider response")

    class Client:
        Emails = FailingEmails

    monkeypatch.setenv("DIGEST_EMAIL", "digest@example.com")
    monkeypatch.setattr(email, "_resend_client", lambda: Client())
    monkeypatch.setattr(email, "_build_digest_from_cache", lambda: {})

    with pytest.raises(HTTPException) as exc:
        asyncio.run(email._send_digest())

    assert exc.value.status_code == 502
    assert exc.value.detail == "Email delivery failed"
    assert "secret provider response" not in exc.value.detail
