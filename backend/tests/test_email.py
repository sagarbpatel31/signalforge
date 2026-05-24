from app.routers import email as email_mod


def test_build_digest_from_cache(monkeypatch):
    fake = {
        "news":   [{"title": "Figure ships humanoid", "url": "u1", "source": "TechCrunch"}],
        "papers": [{"title": "A diffusion policy paper", "url": "u2", "venue": "arXiv"}],
        "jobs":   [{"title": "Robotics Engineer", "company": "Hailo", "url": "u3", "location": "Remote"}],
    }
    monkeypatch.setattr(
        "app.ingestion.sources.read_cache",
        lambda name: fake.get(name),
    )

    data = email_mod._build_digest_from_cache()

    assert data["headline"] == "Figure ships humanoid"
    titles = {s["title"] for s in data["sections"]}
    assert {"News", "Research", "Jobs"} <= titles
    assert "Hailo" in data["action_item"]


def test_build_digest_empty_cache(monkeypatch):
    monkeypatch.setattr("app.ingestion.sources.read_cache", lambda name: [])
    data = email_mod._build_digest_from_cache()
    assert data["sections"] == []
    assert data["headline"]  # non-empty fallback


def test_render_html_contains_content():
    html = email_mod._render_html({
        "headline": "Today matters",
        "sections": [{"title": "News", "items": ["item one"]}],
        "action_item": "Do the thing",
    })
    assert "Today matters" in html
    assert "Do the thing" in html
    assert "<!DOCTYPE html>" in html
