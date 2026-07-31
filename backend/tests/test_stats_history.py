from datetime import datetime, timezone

from app.ingestion import scheduler
from app.routers import brief


def _fake_kv(monkeypatch, store: dict):
    monkeypatch.setattr("app.kv.kv_get", lambda key: store.get(key))
    monkeypatch.setattr(
        "app.kv.kv_set", lambda key, value, ttl=0: store.__setitem__(key, value)
    )


def test_snapshot_appends_one_entry_per_day(monkeypatch):
    store: dict = {}
    _fake_kv(monkeypatch, store)
    today = datetime.now(timezone.utc).date().isoformat()

    scheduler._record_daily_snapshot({"news": 10, "papers": 4, "jobs": 20})
    # Second run on the same day overwrites rather than duplicating.
    scheduler._record_daily_snapshot({"news": 12, "papers": 5, "jobs": 25})

    history = store["cache:history"]
    assert len(history) == 1
    assert history[0] == {"date": today, "news": 12, "papers": 5, "jobs": 25}


def test_snapshot_retains_only_the_last_30_days(monkeypatch):
    store = {
        "cache:history": [
            {"date": f"2026-06-{d:02d}", "news": d, "papers": d, "jobs": d}
            for d in range(1, 31)
        ]
    }
    _fake_kv(monkeypatch, store)

    scheduler._record_daily_snapshot({"news": 1, "papers": 1, "jobs": 1})

    history = store["cache:history"]
    assert len(history) == scheduler.HISTORY_DAYS
    assert history[0]["date"] == "2026-06-02"  # oldest day dropped


def test_series_needs_two_points(monkeypatch):
    assert brief._series([{"date": "2026-06-01", "jobs": 5}], "jobs") == []
    assert brief._series(
        [{"date": "2026-06-01", "jobs": 5}, {"date": "2026-06-02", "jobs": 8}], "jobs"
    ) == [5, 8]


def test_stats_carry_real_series_from_history(monkeypatch):
    history = [
        {"date": "2026-07-01", "news": 10, "papers": 2, "jobs": 20},
        {"date": "2026-07-02", "news": 14, "papers": 3, "jobs": 30},
    ]
    store = {"cache:history": history}
    _fake_kv(monkeypatch, store)
    monkeypatch.setattr(
        "app.ingestion.sources.read_cache",
        lambda name: {"counts": {"news": 14, "papers": 3, "jobs": 30}, "last_refresh": ""}
        if name == "meta"
        else None,
    )

    stats = {s.label: s for s in brief._build_stats_from_cache()}

    assert stats["Hiring Signals"].series == [20, 30]
    assert stats["Research Papers"].series == [2, 3]
    assert stats["Signals Tracked"].series == [32, 47]
    # Derived stats use the same formula as their displayed value.
    assert stats["Opportunities"].series == [8, 11]
    assert stats["Startups Flagged"].series == [23, 34]  # 30 * 1.15 = 34.5, banker's rounding


def test_stats_omit_series_when_history_is_cold(monkeypatch):
    _fake_kv(monkeypatch, {})
    monkeypatch.setattr(
        "app.ingestion.sources.read_cache",
        lambda name: {"counts": {"news": 14, "papers": 3, "jobs": 30}, "last_refresh": ""}
        if name == "meta"
        else None,
    )

    assert all(s.series == [] for s in brief._build_stats_from_cache())
