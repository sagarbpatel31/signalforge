import re


DEFAULT_USER_KEY = "default"


def normalize_user_key(raw: str | None) -> str:
    value = (raw or "").strip().lower()
    if value.startswith("@"):
        value = value[1:]
    value = re.sub(r"[^a-z0-9._-]+", "-", value)
    value = re.sub(r"-{2,}", "-", value).strip("-._")
    return value or DEFAULT_USER_KEY
