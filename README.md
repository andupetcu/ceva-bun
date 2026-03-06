# Ceva Bun — Monorepo (MVP)

End-to-end app per implementation plan: FastAPI backend + React (Vite) frontend. Since the products database is not ready, the API uses an in-memory repository with sample data and the same API contract you will use once Postgres is connected.

## Structure
- `apps/api` — FastAPI service with stubbed data and endpoints
- `apps/web` — React + Vite app with Tailwind, basic flows wired to API
- `infra/` — docker-compose and nginx sample
- `docs/` — API spec overview

## Quickstart

Prereqs: Python 3.11+, Node 18+/pnpm (or npm), Postgres (optional for later).

1) API
```
cd apps/api
cp .env.example .env   # adjust ALLOWED_ORIGINS if needed
pip install -r requirements.txt
uvicorn apps.api.main:app --reload --port 8000
```

2) Web
```
cd apps/web
cp .env.example .env
pnpm install   # or npm install
pnpm dev -- --host
```

Open http://localhost:5173 — by default the script points to `http://localhost:8001`.

## API Contract
See `docs/api-spec.md`. Endpoints provided with in-memory data:
- `GET /health`
- `GET /v1/categories`
- `GET /v1/products` (filters: category, min_price, max_price, limit, offset)
- `GET /v1/products/random` (requires category)
- `GET /v1/products/{id}`
- `GET /v1/sources`

## Next steps (DB ready)
- Add SQLAlchemy models, Alembic migrations (schema from the plan)
- Swap `InMemoryProductRepo` with a Postgres-backed repo
- Keep the same Pydantic response models to avoid frontend changes

## Docker (optional)
```
cd infra
docker-compose up --build
```

This runs both services; adjust `.env` files as needed.

## One‑liner Dev Script

Run both API and Web with a single command (uses Python venv automatically):

```
make start                 # defaults to API on :8001
# or
bash scripts/dev.sh start --port 8001
```

Helpful commands:
- `make status` or `bash scripts/dev.sh status`
- `make logs` to tail both processes
- `make stop` to stop both servers
