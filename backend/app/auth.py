"""
Session identity.

Before this module, the user key arrived as a plain ``X-SignalForge-User``
header the client chose for itself, so anyone could read or overwrite anyone
else's profile and workbench by guessing a handle. Now the backend mints an
opaque random user id, signs it with ``SESSION_SECRET``, and only accepts ids
carrying a valid signature. The id is unguessable and the signature is
unforgeable without the secret, so a caller can only reach its own data.

Token format: ``<user_id>.<hex signature>`` where ``user_id`` is ``u_<32 hex>``.
"""
import hashlib
import hmac
import logging
import os
import secrets
from pathlib import Path
from typing import Optional

from fastapi import Header, HTTPException

logger = logging.getLogger(__name__)

TOKEN_HEADER = "X-SignalForge-Token"

# Local dev without a configured secret would otherwise re-issue a fresh secret
# on every reload, invalidating tokens and logging the user out constantly.
# Persisting one under backend/data keeps a dev session alive across restarts.
_DEV_SECRET_FILE = Path(__file__).parent.parent / "data" / ".session_secret"

_cached_secret: Optional[str] = None


def _is_production() -> bool:
    return bool(os.environ.get("VERCEL")) or os.environ.get("ENV", "").lower() in {
        "production",
        "prod",
    }


def _secret() -> Optional[str]:
    """Resolve the signing secret. Returns None only when production is missing
    its SESSION_SECRET — the caller turns that into a 503 rather than falling
    back to something forgeable."""
    global _cached_secret
    if _cached_secret:
        return _cached_secret

    configured = os.environ.get("SESSION_SECRET", "").strip()
    if configured:
        _cached_secret = configured
        return _cached_secret

    if _is_production():
        logger.error("SESSION_SECRET is not set — refusing to issue or verify sessions.")
        return None

    try:
        if _DEV_SECRET_FILE.exists():
            _cached_secret = _DEV_SECRET_FILE.read_text().strip()
        if not _cached_secret:
            _cached_secret = secrets.token_hex(32)
            _DEV_SECRET_FILE.parent.mkdir(parents=True, exist_ok=True)
            _DEV_SECRET_FILE.write_text(_cached_secret)
            logger.warning(
                "SESSION_SECRET unset — generated a local dev secret at %s. "
                "Set SESSION_SECRET before deploying.",
                _DEV_SECRET_FILE,
            )
    except Exception as exc:  # unwritable fs (read-only container) — stay in memory
        logger.warning("Could not persist dev session secret: %s", exc)
        _cached_secret = _cached_secret or secrets.token_hex(32)

    return _cached_secret


def _sign(user_id: str, secret: str) -> str:
    return hmac.new(secret.encode(), user_id.encode(), hashlib.sha256).hexdigest()


def issue_token() -> str:
    """Mint a brand-new session. The id is random, so sessions cannot be
    enumerated and no user-supplied value (name, handle) leaks into the key."""
    secret = _secret()
    if secret is None:
        raise HTTPException(status_code=503, detail="SESSION_SECRET not configured")
    user_id = f"u_{secrets.token_hex(16)}"
    return f"{user_id}.{_sign(user_id, secret)}"


def verify_token(token: str) -> Optional[str]:
    """Return the user id carried by a valid token, or None."""
    if not token or "." not in token:
        return None
    secret = _secret()
    if secret is None:
        return None
    user_id, _, signature = token.rpartition(".")
    if not user_id.startswith("u_") or not signature:
        return None
    if not hmac.compare_digest(signature, _sign(user_id, secret)):
        return None
    return user_id


def resolve_user(token: Optional[str]) -> Optional[str]:
    """Map a raw header value to a user id. None means anonymous."""
    if not token:
        return None
    return verify_token(token.strip())


async def current_user(
    x_signalforge_token: Optional[str] = Header(default=None),
) -> str:
    """Dependency for endpoints that own per-user data. Anonymous callers and
    bad signatures both get 401 — there is no shared bucket to fall into."""
    user_id = resolve_user(x_signalforge_token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid or missing session")
    return user_id


async def optional_user(
    x_signalforge_token: Optional[str] = Header(default=None),
) -> Optional[str]:
    """Dependency for endpoints that personalize when possible but still serve
    anonymous callers (the job feed, for example)."""
    return resolve_user(x_signalforge_token)
