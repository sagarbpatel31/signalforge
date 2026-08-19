import asyncio

from app.ingestion import scheduler


def _cache(monkeypatch, store: dict):
    monkeypatch.setattr(scheduler, "read_cache", lambda name: store.get(name))
    monkeypatch.setattr(scheduler, "write_cache", lambda name, value: store.__setitem__(name, value))
    monkeypatch.setattr(scheduler, "_update_weekly_baseline", lambda counts: None)
    monkeypatch.setattr(scheduler, "_record_daily_snapshot", lambda counts: None)
    monkeypatch.setattr(
        "app.routers.twitter.generate_posts_from_cache",
        lambda: [],
    )


def test_failed_source_preserves_last_known_good_cache(monkeypatch):
    previous_refresh = "2026-08-17T10:00:00+00:00"
    old_jobs = [{"title": "Existing role"}]
    store = {
        "news": [{"title": "Old news"}],
        "papers": [{"title": "Old paper"}],
        "jobs": old_jobs,
        "meta": {
            "last_refresh": previous_refresh,
            "counts": {"news": 1, "papers": 1, "jobs": 1},
        },
    }
    _cache(monkeypatch, store)

    async def news():
        return [{"title": "Fresh news"}, {"title": "Another signal"}]

    async def papers():
        return [{"title": "Fresh paper"}]

    async def jobs():
        raise TimeoutError("provider detail must not be exposed")

    monkeypatch.setattr(scheduler, "fetch_news", news)
    monkeypatch.setattr(scheduler, "fetch_papers", papers)
    monkeypatch.setattr(scheduler, "fetch_jobs", jobs)

    counts = asyncio.run(scheduler.run_ingestion())

    assert counts == {"news": 2, "papers": 1, "jobs": 1}
    assert store["jobs"] == old_jobs
    assert store["meta"]["source_mode"] == "degraded"
    assert store["meta"]["sources"]["jobs"]["status"] == "error"
    assert store["meta"]["sources"]["jobs"]["error_code"] == "timeout"
    assert store["meta"]["sources"]["jobs"]["last_success"] == previous_refresh


def test_cold_failed_ingestion_stays_in_fallback_mode(monkeypatch):
    store: dict = {}
    _cache(monkeypatch, store)

    async def fail():
        return []

    monkeypatch.setattr(scheduler, "fetch_news", fail)
    monkeypatch.setattr(scheduler, "fetch_papers", fail)
    monkeypatch.setattr(scheduler, "fetch_jobs", fail)

    counts = asyncio.run(scheduler.run_ingestion())

    assert counts == {"news": 0, "papers": 0, "jobs": 0}
    assert store["meta"]["source_mode"] == "fallback"
    assert all(
        source["error_code"] == "empty_result"
        for source in store["meta"]["sources"].values()
    )
