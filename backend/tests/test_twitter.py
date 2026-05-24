from app.routers.twitter import _clean, _truncate


def test_clean_strips_source_suffix():
    assert _clean("Big news on robotics - TechCrunch") == "Big news on robotics"
    assert _clean("Edge AI breakthrough | VentureBeat") == "Edge AI breakthrough"
    assert _clean("Humanoids ship — IEEE Spectrum") == "Humanoids ship"


def test_clean_truncates_long_titles():
    title = "word " * 40  # ~200 chars
    out = _clean(title, max_len=30)
    assert len(out) <= 31  # max_len plus the ellipsis
    assert out.endswith("…")


def test_truncate_leaves_short_text_untouched():
    assert _truncate("short tweet") == "short tweet"


def test_truncate_caps_at_limit_with_ellipsis():
    text = "x " * 200  # 400 chars
    out = _truncate(text, limit=50)
    assert len(out) <= 51
    assert out.endswith("…")
