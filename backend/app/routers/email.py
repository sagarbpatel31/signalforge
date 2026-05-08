import os
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api", tags=["email"])

TO_EMAIL = os.environ.get("DIGEST_EMAIL", "sagarpat3199@gmail.com")
FROM_EMAIL = "SignalForge <noreply@signalforge.dev>"


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


def _render_html(data: dict) -> str:
    headline = data.get("headline", "Your daily intelligence brief")
    sections = data.get("sections", [])
    action_item = data.get("action_item", "")
    date_str = datetime.now(timezone.utc).strftime("%B %d, %Y")

    def _section(sec: dict) -> str:
        items_html = "".join(
            f'<li style="margin:7px 0;color:#c5c8d0;font-size:14px;line-height:1.6;'
            f'padding-left:14px;position:relative;">'
            f'<span style="position:absolute;left:0;color:#5b9bd5;">›</span>{item}</li>'
            for item in sec.get("items", [])
        )
        title = sec.get("title", "")
        return f"""
        <div style="margin-bottom:26px;">
          <div style="font-family:monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;
                      color:#5b9bd5;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #1e2230;">
            {title}
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
      SignalForge AI Intelligence Terminal
    </div>
  </div>

</div>
</body>
</html>"""


@router.post("/send-digest")
async def send_digest():
    """Generate intelligence digest and send to configured email via Resend."""
    from .generate import _generate_digest_content
    resend = _resend_client()
    data = await _generate_digest_content()
    html = _render_html(data)
    date_str = datetime.now(timezone.utc).strftime("%b %d")
    try:
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": [TO_EMAIL],
            "subject": f"SignalForge Brief — {date_str}",
            "html": html,
        })
        return {"ok": True, "sent_to": TO_EMAIL}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email send failed: {e}")
