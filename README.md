# SignalForge

An AI intelligence terminal for engineers and founders in deep-tech — robotics,
edge/physical AI, embedded, and foundation models. SignalForge ingests news,
research, and hiring signals from across the ecosystem, then uses Claude to turn
them into a personalized daily brief, post drafts, weekly reviews, and an email
digest.

## Architecture

```
frontend/  Next.js 16 (App Router, React 19, Tailwind v4)  →  Vercel
backend/   FastAPI (Python 3.11)                            →  Vercel function or Railway
           ├─ ingestion: RSS + arXiv + job boards + watchlist (every 12h)
           ├─ storage:   Upstash Redis KV (file fallback for local dev)
           ├─ AI:        Anthropic Claude (brief / posts / tasks / weekly / digest)
           └─ email:     Resend (daily digest)
api/index.py  thin shim that mounts backend/main.py for Vercel
```

The frontend talks to the backend over HTTP via `NEXT_PUBLIC_API_URL`. Each
fetcher falls back to static mock data, so the UI renders even when the API is
cold or unreachable.

### Data flow

1. A scheduler (APScheduler locally, Vercel Cron in production) hits
   `/api/ingest` twice a day.
2. Ingestion pulls RSS feeds, arXiv queries, and job-board APIs
   (Lever / Greenhouse / Ashby / Remotive), filters them by keyword, and writes
   the results to Redis with a TTL.
3. Pages read the cached feeds; AI endpoints layer Claude on top of the cached
   signals to produce the brief, posts, tasks, weekly review, and digest.

## Local development

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # fill in keys (Redis + Claude are optional locally)
uvicorn main:app --reload --port 8000
```

Without Upstash credentials the KV layer falls back to JSON files under
`backend/data/`. Without `ANTHROPIC_API_KEY` the AI endpoints return `503`, but
the feed/ingestion endpoints still work.

### Frontend

```bash
cd frontend
npm install
# point the UI at your local API (defaults to http://localhost:8000)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev                   # http://localhost:3000
```

## Tests

```bash
# backend
cd backend && pip install -r requirements-dev.txt && pytest

# frontend
cd frontend && npm test
```

CI runs both suites plus frontend lint and build on every push to `main` and on
pull requests (see `.github/workflows/ci.yml`).

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | backend | Claude API key (AI generation) |
| `ANTHROPIC_MODEL` | backend | Optional — pin a Claude model (default `claude-opus-4-7`) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | backend | Redis KV cache |
| `RESEND_API_KEY` / `RESEND_FROM` / `DIGEST_EMAIL` | backend | Daily digest email |
| `SESSION_SECRET` | backend | **Required in production.** Signs session tokens; rotating it logs everyone out |
| `CRON_SECRET` | backend | `/api/ingest` requires `Authorization: Bearer <secret>`. Required in production |
| `FRONTEND_URL` | backend | CORS allow-list (also scopes Vercel preview origins) |
| `CORS_ALLOW_ORIGIN_REGEX` | backend | Optional CORS regex override |
| `NEXT_PUBLIC_API_URL` | frontend | Backend base URL |

See `backend/.env.example` for the full list.

## Deployment

- **Backend** deploys from the repo root: `vercel.json` routes all traffic to
  `api/index.py` (which mounts the FastAPI app) and defines the ingest cron.
  `backend/` also ships `railway.json` and `nixpacks.toml` for hosting the API
  on Railway instead.
- **Frontend** deploys from `frontend/` as a standard Next.js project; set
  `NEXT_PUBLIC_API_URL` to the deployed backend URL.

Set `SESSION_SECRET` and `CRON_SECRET` in the backend's project before going
live. Both fail closed in production: without `SESSION_SECRET` the API cannot
issue or verify sessions, and without `CRON_SECRET` the ingest endpoint (which
also sends the digest email) returns 503 instead of running unauthenticated.

## Sessions

Per-user data — profile, workbench, bookmarks — is keyed by an opaque session
id the backend mints and signs with `SESSION_SECRET`. The browser stores the
`<user_id>.<signature>` token and replays it in `X-SignalForge-Token`; the
backend only honours ids whose signature verifies, so keys are neither
guessable nor forgeable. Onboarding mints the session before the first profile
save.

`scripts/mint_session.py` mints a token from the command line and can copy an
older key's data onto it:

```bash
backend/.venv/bin/python scripts/mint_session.py --adopt sagar-patel
```
