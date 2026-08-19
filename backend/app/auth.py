"""Verified account identity with a signed-session compatibility path.

Clerk bearer tokens are the production identity. The older SignalForge HMAC
session remains available for keyless local development and one-time account
migration, but production stops accepting it once Clerk is configured.
"""
import hashlib
import hmac
import logging
import os
import secrets
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, Request
from starlette.concurrency import run_in_threadpool

logger = logging.getLogger(__name__)

TOKEN_HEADER = "X-SignalForge-Token"

# Local dev without a configured secret would otherwise re-issue a fresh secret
# on every reload, invalidating tokens and logging the user out constantly.
# Persisting one under backend/data keeps a dev session alive across restarts.
_cached_secret: Optional[str] = None


def _dev_secret_file() -> Path:
    data_dir = Path(
        os.environ.get("SIGNALFORGE_DATA_DIR", Path(__file__).parent.parent / "data")
    ).expanduser()
    return data_dir / ".session_secret"


def _is_production() -> bool:
    return bool(os.environ.get("VERCEL")) or os.environ.get("ENV", "").lower() in {
        "production",
        "prod",
    }


def clerk_configured() -> bool:
    return bool(os.environ.get("CLERK_SECRET_KEY", "").strip())


def legacy_sessions_allowed() -> bool:
    override = os.environ.get("ALLOW_LEGACY_SESSIONS", "").strip().lower()
    if override in {"1", "true", "yes"}:
        return True
    if override in {"0", "false", "no"}:
        return False
    return not (_is_production() and clerk_configured())


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
        secret_file = _dev_secret_file()
        if secret_file.exists():
            _cached_secret = secret_file.read_text().strip()
        if not _cached_secret:
            _cached_secret = secrets.token_hex(32)
            secret_file.parent.mkdir(parents=True, exist_ok=True)
            secret_file.write_text(_cached_secret)
            logger.warning(
                "SESSION_SECRET unset — generated a local dev secret at %s. "
                "Set SESSION_SECRET before deploying.",
                secret_file,
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


def _authorized_parties() -> list[str]:
    configured = os.environ.get("CLERK_AUTHORIZED_PARTIES", "")
    parties = [item.strip() for item in configured.split(",") if item.strip()]
    if parties:
        return parties

    fallback = ["http://localhost:3000"]
    frontend_url = os.environ.get("FRONTEND_URL", "").strip()
    if frontend_url:
        fallback.append(frontend_url)
    return fallback


def _account_key(subject: str) -> str:
    digest = hashlib.sha256(subject.encode()).hexdigest()[:32]
    return f"c_{digest}"


def _verify_clerk_request(request: Request) -> Optional[str]:
    if not clerk_configured():
        return None

    try:
        from clerk_backend_api import AuthenticateRequestOptions, authenticate_request

        jwt_key = os.environ.get("CLERK_JWT_KEY", "").replace("\\n", "\n").strip()
        state = authenticate_request(
            request,
            AuthenticateRequestOptions(
                secret_key=os.environ["CLERK_SECRET_KEY"],
                jwt_key=jwt_key or None,
                authorized_parties=_authorized_parties(),
                accepts_token=["session_token"],
            ),
        )
        payload = state.payload or {}
        subject = payload.get("sub") if state.is_signed_in else None
        if not isinstance(subject, str) or not subject.startswith("user_"):
            return None
        return _account_key(subject)
    except Exception as exc:
        logger.warning("Clerk token verification failed: %s", exc)
        return None


async def _clerk_user(request: Request) -> Optional[str]:
    return await run_in_threadpool(_verify_clerk_request, request)


async def current_clerk_user(request: Request) -> str:
    """Require a Clerk account. Used for migration and account-only actions."""
    user_id = await _clerk_user(request)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid or missing account token")
    return user_id


async def current_user(
    request: Request,
) -> str:
    """Resolve a verified Clerk account or an allowed legacy local session."""
    authorization = request.headers.get("Authorization", "")
    if authorization.startswith("Bearer "):
        user_id = await _clerk_user(request)
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid account token")
        return user_id

    legacy_token = request.headers.get(TOKEN_HEADER)
    user_id = resolve_user(legacy_token) if legacy_sessions_allowed() else None
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid or missing session")
    return user_id


async def optional_user(
    request: Request,
) -> Optional[str]:
    authorization = request.headers.get("Authorization", "")
    if authorization.startswith("Bearer "):
        return await _clerk_user(request)
    if not legacy_sessions_allowed():
        return None
    return resolve_user(request.headers.get(TOKEN_HEADER))


def verify_cron_authorization(authorization: Optional[str]) -> None:
    """Validate Vercel cron authorization and fail closed in production."""
    secret = os.environ.get("CRON_SECRET", "")
    if not secret:
        if _is_production():
            raise HTTPException(status_code=503, detail="CRON_SECRET not configured")
        return
    expected = f"Bearer {secret}"
    if not authorization or not hmac.compare_digest(authorization, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")
