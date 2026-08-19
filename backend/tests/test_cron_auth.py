import pytest
from fastapi import HTTPException

import main


def test_verify_cron_allows_when_secret_unset(monkeypatch):
    monkeypatch.delenv("CRON_SECRET", raising=False)
    main._verify_cron(None)  # should not raise


def test_verify_cron_accepts_correct_bearer(monkeypatch):
    monkeypatch.setenv("CRON_SECRET", "s3cr3t")
    main._verify_cron("Bearer s3cr3t")  # should not raise


def test_verify_cron_rejects_missing_header(monkeypatch):
    monkeypatch.setenv("CRON_SECRET", "s3cr3t")
    with pytest.raises(HTTPException) as exc:
        main._verify_cron(None)
    assert exc.value.status_code == 401


def test_verify_cron_rejects_wrong_secret(monkeypatch):
    monkeypatch.setenv("CRON_SECRET", "s3cr3t")
    with pytest.raises(HTTPException) as exc:
        main._verify_cron("Bearer wrong")
    assert exc.value.status_code == 401


def test_ingest_endpoint_returns_401_without_secret(monkeypatch):
    monkeypatch.setenv("CRON_SECRET", "s3cr3t")
    monkeypatch.setenv("VERCEL", "1")  # skip the scheduler/ingestion task in lifespan
    from fastapi.testclient import TestClient

    with TestClient(main.app) as client:
        resp = client.get("/api/ingest")
    assert resp.status_code == 401


def test_digest_endpoint_returns_401_before_email_configuration(monkeypatch):
    monkeypatch.setenv("CRON_SECRET", "s3cr3t")
    monkeypatch.setenv("VERCEL", "1")
    from fastapi.testclient import TestClient

    with TestClient(main.app) as client:
        response = client.post("/api/send-digest")

    assert response.status_code == 401
