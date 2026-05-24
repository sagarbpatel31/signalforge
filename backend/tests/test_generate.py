import pytest

from app.routers.generate import _extract_json, _profile_context


def test_extract_json_plain_object():
    assert _extract_json('{"a": 1, "b": [2, 3]}') == {"a": 1, "b": [2, 3]}


def test_extract_json_strips_code_fences():
    fenced = '```json\n{"market_pulse": "ok", "signals": []}\n```'
    assert _extract_json(fenced) == {"market_pulse": "ok", "signals": []}


def test_extract_json_handles_list_payload():
    assert _extract_json("[1, 2, 3]") == [1, 2, 3]


def test_extract_json_raises_on_garbage():
    with pytest.raises(Exception):
        _extract_json("not json at all")


def test_profile_context_defaults_when_none():
    ctx = _profile_context(None)
    assert "domains" in ctx and "Robotics" in ctx
