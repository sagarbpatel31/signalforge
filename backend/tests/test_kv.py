from app import kv


def test_placeholder_redis_configuration_stays_in_file_mode(monkeypatch):
    monkeypatch.setenv("UPSTASH_REDIS_REST_URL", "https://your-db.upstash.io")
    monkeypatch.setenv("UPSTASH_REDIS_REST_TOKEN", "your_token_here")

    assert kv.storage_mode() == "file"
    assert kv._redis() is None
