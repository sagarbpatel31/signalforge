import re

import main


def test_origin_regex_uses_override(monkeypatch):
    monkeypatch.setenv("CORS_ALLOW_ORIGIN_REGEX", r"https://example\.com")
    assert main._build_origin_regex() == r"https://example\.com"


def test_origin_regex_scopes_to_project(monkeypatch):
    monkeypatch.delenv("CORS_ALLOW_ORIGIN_REGEX", raising=False)
    monkeypatch.setattr(main, "_extra", "https://signalforge.vercel.app")

    rx = main._build_origin_regex()
    assert rx is not None
    pattern = re.compile(rx)

    assert pattern.fullmatch("https://signalforge.vercel.app")
    assert pattern.fullmatch("https://signalforge-git-main-team.vercel.app")
    assert not pattern.fullmatch("https://evil.vercel.app")


def test_origin_regex_none_for_custom_domain(monkeypatch):
    monkeypatch.delenv("CORS_ALLOW_ORIGIN_REGEX", raising=False)
    monkeypatch.setattr(main, "_extra", "https://signalforge.com")
    assert main._build_origin_regex() is None
