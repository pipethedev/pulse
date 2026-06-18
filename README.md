# Pulse — visual uptime monitor

A small but real app that exercises four Brimble primitives in one flow:

- **API** (Hono) — register sites, trigger checks, serve results
- **Database** (CockroachDB) — sites + check history + screenshot keys
- **Sandbox** (`@brimble/sandbox`) — headless Chromium screenshots, isolated per run
- **Object Storage** (S3-compatible) — stores the PNGs, served from `*.objects.brimble.io`

…plus a minimal **dashboard** (React + Vite + Tailwind + shadcn/ui) that lists
monitored sites with their latest screenshot, status, and lets you add a site or
trigger a check on demand.

## How a check flows

```
POST /sites/:id/check
        │
        ▼
  check-service ──▶ sandbox runner ──▶ Brimble sandbox (Chromium)
        │                                     │  screenshot + status + latency
        │            ◀────────────────────────┘
        ├──▶ object storage (upload PNG)
        └──▶ CockroachDB (insert checks row with screenshot key)
        ▼
  GET /sites/:id  ──▶ returns history + public screenshot URL
```

The screenshot work runs **inside** the sandbox, not in the API process. That's
the point: heavy, untrusted-adjacent browser automation stays isolated by gVisor,
and the API just orchestrates the lifecycle.

## Layout

An npm-workspaces monorepo:

```
apps/
  api/                 the backend (Hono)
    src/
      config/          env parsing (one place, validated at startup)
      types/           domain types + enums, dedicated files
      db/              pool, migrations, mappers, repositories (one per table)
      storage/         S3 client + screenshot upload/URL
      sandbox/         screenshot script (runs in sandbox), runner, worker
      api/             schemas, routes, services, error handler, view assembly
      server.ts        entry
  web/                 the dashboard (React + Vite + Tailwind + shadcn/ui)
    src/
      components/      site card, add-site dialog, shadcn ui primitives
      lib/             api client, formatting helpers
      App.tsx          dashboard shell
```

## Run locally

```bash
npm install                 # installs both workspaces from the repo root

# API (apps/api)
cp apps/api/.env.example apps/api/.env   # fill in real values
npm run migrate             # apply schema to CockroachDB
npm run dev                 # start API on :8080

# Dashboard (apps/web), in a second terminal
npm run dev:web             # Vite dev server on :5173, proxies /sites + /health → :8080
```

The Vite dev server proxies API calls to `http://localhost:8080` by default
(override with `VITE_API_TARGET`), so the dashboard talks to the API with no CORS
setup. `npm run build` builds both workspaces.

## Endpoints

| Method | Path                | Purpose                                  |
| ------ | ------------------- | ---------------------------------------- |
| GET    | `/health`           | liveness                                 |
| POST   | `/sites`            | `{ "url": "..." }` → register a site     |
| GET    | `/sites`            | all sites + latest check + screenshot    |
| GET    | `/sites/:id`        | one site + full check history            |
| POST   | `/sites/:id/check`  | run a check now (spins up a sandbox)     |

## Sandbox modes

Set via env on the worker (`npm run worker`):

- `SANDBOX_MODE=one-shot` — run one pass over all sites and exit (the API's
  per-site `POST /:id/check` is the interactive equivalent).
- `SANDBOX_MODE=interval` + `CHECK_INTERVAL_MINUTES=15` — self-scheduling loop,
  deploy as a Brimble worker.

## 90-second demo script

1. `npm run migrate` — schema lands in CockroachDB.
2. Start the API. Hit `GET /health` → `{ "status": "ok" }`.
3. `POST /sites { "url": "https://stripe.com" }` — row appears.
4. `POST /sites/:id/check` — on camera, a sandbox spins up, Chromium screenshots
   the page, the PNG lands in object storage, a checks row is written.
5. `GET /sites/:id` — history populated, `screenshotUrl` points at
   `*.objects.brimble.io`. Open it: live screenshot.
6. Close on `GET /sites` — every monitored site with its latest thumbnail.
