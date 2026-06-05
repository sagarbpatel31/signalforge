from app.ingestion.sources import _is_relevant, _extract_tags, _role_matches_keywords
from app.routers.brief import _build_brief_from_cache
from app.routers.feeds import get_meta
from app.schemas import FeedMetaResponse


def test_brief_marks_fallback_when_cache_is_cold(monkeypatch):
    monkeypatch.setattr("app.ingestion.sources.read_cache", lambda _: [])
    brief = _build_brief_from_cache()
    assert brief.source_mode == "fallback"
    assert "Cache cold" in brief.source_detail


def test_feed_meta_marks_fallback_when_empty(monkeypatch):
    monkeypatch.setattr("app.routers.feeds.read_cache", lambda _: {"last_refresh": None, "counts": {}})
    meta = __import__("asyncio").run(get_meta())
    assert isinstance(meta, FeedMetaResponse)
    assert meta.source_mode == "fallback"


def test_is_relevant_matches_keywords():
    assert _is_relevant("New humanoid robot unveiled by Figure")
    assert _is_relevant("Anthropic raises a Series C round")
    assert not _is_relevant("A guide to baking sourdough bread")


def test_is_relevant_is_case_insensitive():
    assert _is_relevant("EDGE AI is eating embedded")
    assert _is_relevant("edge ai is eating embedded")


def test_extract_tags_detects_domains():
    tags = _extract_tags("A new LLM foundation model from Mistral")
    assert "llm" in tags
    assert len(tags) <= 3


def test_extract_tags_falls_back_to_tech():
    assert _extract_tags("completely unrelated content") == ["tech"]


def test_role_matches_keywords():
    assert _role_matches_keywords("Senior Robotics Engineer")
    assert _role_matches_keywords("Embedded Software Engineer")
    assert not _role_matches_keywords("Director of Marketing")
