# SignalForge — frontend

The Next.js 16 (App Router, React 19, Tailwind v4) UI for SignalForge. For the
full project overview, architecture, and deployment notes, see the
[root README](../README.md).

## Develop

```bash
npm install
# point the UI at your API (defaults to http://localhost:8000)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev   # http://localhost:3000
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Run the Vitest unit suite |

Each API fetcher in `src/lib/api.ts` falls back to static mock data
(`src/lib/mock-data.ts`), so pages render even when the backend is unavailable.
