import os
import logging
from datetime import datetime, timezone
from html import escape
from urllib.parse import urlparse

from fastapi import APIRouter, Header, HTTPException

from ..auth import verify_cron_authorization

router = APIRouter(prefix="/api", tags=["email"])

# Set RESEND_FROM in Vercel env vars.
# Free Resend accounts can only send from onboarding@resend.dev until you
# verify a domain. Set RESEND_FROM=onboarding@resend.dev while testing.
FROM_EMAIL = os.environ.get("RESEND_FROM", "SignalForge <noreply@signalforge.dev>")
logger = logging.getLogger(__name__)


def _safe_url(value: object) -> str:
    candidate = str(value or "").strip()
    parsed = urlparse(candidate)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        return "#"
    return escape(candidate, quote=True)


def _link(url: object, label: object) -> str:
    return (
        f'<a href="{_safe_url(url)}" style="color:#5b9bd5;text-decoration:none;">'
        f"{escape(str(label or 'Untitled'))}</a>"
    )


def _resend_client():
    try:
        import resend as _r
    except ImportError:
        raise HTTPException(status_code=503, detail="resend package not installed")
    api_key = os.environ.get("RESEND_API_KEY", "")
    if not api_key or api_key.startswith("your_"):
        raise HTTPException(status_code=503, detail="RESEND_API_KEY not configured")
    _r.api_key = api_key
    return _r


def _build_digest_from_cache() -> dict:
    """Build digest from cached news/papers/jobs — no Claude needed."""
    from ..ingestion.sources import read_cache

    news   = read_cache("news")   or []
    papers = read_cache("papers") or []
    jobs   = read_cache("jobs")   or []

    sections = []

    if news:
        sections.append({
            "title": "News",
            "items": [
                f'{_link(n.get("url"), n.get("title"))} '
                f'<span style="color:#555f70;">— {escape(str(n.get("source", "News")))}</span>'
                for n in news[:6]
            ],
        })

    if papers:
        sections.append({
            "title": "Research",
            "items": [
                f'{_link(p.get("url"), str(p.get("title", ""))[:100])} '
                f'<span style="color:#555f70;">({escape(str(p.get("venue", "Research")))})</span>'
                for p in papers[:5]
            ],
        })

    if jobs:
        sections.append({
            "title": "Jobs",
            "items": [
                f'{_link(j.get("url"), j.get("title"))} @ {escape(str(j.get("company", "Unknown")))}'
                f'<span style="color:#555f70;"> · {escape(str(j.get("location", "")))}</span>'
                for j in jobs[:6]
            ],
        })

    # Headline: most recent news title or fallback
    headline = news[0]["title"] if news else "Your SignalForge daily brief is ready."

    # Action item: first job opening or first paper
    if jobs:
        action = f'Apply to {jobs[0]["title"]} at {jobs[0]["company"]} — check Career Radar.'
    elif papers:
        action = f'Read: {papers[0]["title"][:80]}'
    else:
        action = "Check the dashboard for today\'s latest signals."

    return {"headline": headline, "sections": sections, "action_item": action}


def _render_html(data: dict) -> str:
    headline    = escape(str(data.get("headline", "Your daily intelligence brief")))
    sections    = data.get("sections", [])
    action_item = escape(str(data.get("action_item", "")))
    date_str    = datetime.now(timezone.utc).strftime("%B %d, %Y")

    def _section(sec: dict) -> str:
        items_html = "".join(
            f'<li style="margin:7px 0;color:#c5c8d0;font-size:14px;line-height:1.6;'
            f'padding-left:14px;position:relative;">'
            f'<span style="position:absolute;left:0;color:#5b9bd5;">›</span>{item}</li>'
            for item in sec.get("items", [])
        )
        return f"""
        <div style="margin-bottom:26px;">
          <div style="font-family:monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;
                      color:#5b9bd5;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #1e2230;">
            {escape(str(sec.get("title", "")))}
          </div>
          <ul style="list-style:none;padding:0;margin:0;">{items_html}</ul>
        </div>"""

    sections_html = "".join(_section(s) for s in sections)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>SignalForge Brief</title>
</head>
<body style="margin:0;padding:0;background:#141720;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 24px;">

  <!-- Header -->
  <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:28px;">
    <tr>
      <td>
        <span style="font-weight:700;font-size:15px;color:#e8eaf0;letter-spacing:-.02em;">SignalForge</span>
        <span style="font-family:monospace;font-size:9px;color:#444a5a;
                     border-left:1px solid #2a2e3e;padding-left:10px;margin-left:10px;
                     letter-spacing:.08em;text-transform:uppercase;">
          Intelligence Brief &middot; {date_str}
        </span>
      </td>
    </tr>
  </table>

  <!-- Today's Signal -->
  <div style="background:#0c1420;border-left:3px solid #5b9bd5;border-radius:4px;
              padding:14px 18px;margin-bottom:28px;">
    <div style="font-family:monospace;font-size:10px;color:#5b9bd5;letter-spacing:.08em;
                text-transform:uppercase;margin-bottom:6px;">TODAY&rsquo;S SIGNAL</div>
    <div style="font-size:16px;color:#e8eaf0;font-weight:600;line-height:1.45;">{headline}</div>
  </div>

  <!-- Sections -->
  {sections_html}

  <!-- Action Item -->
  <div style="background:#0a2018;border:1px solid #1a4a28;border-radius:8px;
              padding:14px 18px;margin-bottom:32px;">
    <div style="font-family:monospace;font-size:10px;color:#4caf7d;letter-spacing:.08em;
                text-transform:uppercase;margin-bottom:6px;">ACTION ITEM TODAY</div>
    <div style="font-size:14px;color:#c5c8d0;font-weight:500;line-height:1.55;">&rarr; {action_item}</div>
  </div>

  <!-- Footer -->
  <div style="border-top:1px solid #1e2230;padding-top:20px;text-align:center;">
    <div style="font-family:monospace;font-size:10px;color:#444a5a;letter-spacing:.04em;">
      SignalForge Intelligence Terminal
    </div>
  </div>

</div>
</body>
</html>"""


async def _send_digest() -> dict:
    """Send the cached digest after caller authorization has been established."""
    to_email = os.environ.get("DIGEST_EMAIL", "").strip()
    if not to_email:
        raise HTTPException(status_code=503, detail="DIGEST_EMAIL not configured")
    resend    = _resend_client()
    data      = _build_digest_from_cache()
    html      = _render_html(data)
    date_str  = datetime.now(timezone.utc).strftime("%b %d")
    try:
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to":   [to_email],
            "subject": f"SignalForge Brief — {date_str}",
            "html": html,
        })
        return {"ok": True}
    except Exception as exc:
        logger.exception("Digest email delivery failed")
        raise HTTPException(status_code=502, detail="Email delivery failed") from exc


@router.post("/send-digest")
async def send_digest(authorization: str | None = Header(default=None)):
    """Cron-only digest delivery; cached data means no AI provider call."""
    verify_cron_authorization(authorization)
    return await _send_digest()
