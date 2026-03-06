---
title: "Bunăciuni — Implementation Plan (UI + Backend)"
status: Draft
owner: Andrei
lastUpdated: 2025-10-09
---

# Overview
A clean, Apple‑style web app that helps users discover **Ceva Bun de Băut**, **Ceva Bună de Mâncat**, sau **Ceva Bun de Făcut** în funcție de buget. The app shows a random matching item (product or activity) and allows users to view the full list.

**Stack (proposed):**
- **Frontend:** React + Vite, TailwindCSS, shadcn/ui, Framer Motion. (Option B: Rust + Yew + wasm-bindgen)
- **Backend:** Python **FastAPI**, SQLAlchemy 2.0, Alembic migrations.
- **DB:** PostgreSQL (`DATABASE_URL=postgresql://postgres:a3ppq@10.0.0.207:5432/all_products_db`)
- **Auth (phase 2):** Magic links (email), anonymous session tokens for phase 1.
- **Infra:** Docker Compose for local, Nginx (reverse proxy), Caddy/Traefik alt, pm2/uvicorn workers.
- **Observability:** OpenTelemetry (traces), structured logs, Prometheus + Grafana (phase 2).

---

## Phase 0 — Project Setup
**Deliverables**
- Monorepo: `apps/web` (React), `apps/api` (FastAPI), `packages/ui` (design system, optional)
- Dev containers / Dockerfiles for web+api
- Makefile (or taskfiles) for common tasks
- `.env` templates for API & Web

**File Tree (high level)**
```
/ bunaciuni
  /apps
    /web                 # React app
    /api                 # FastAPI service
  /infra
    docker-compose.yml
    nginx.conf
  /docs
    implementation-plan.md
    api-spec.md
  .editorconfig
  .gitignore
  Makefile
```

**.env examples**
```
# apps/api/.env
DATABASE_URL=postgresql://postgres:a3ppq@10.0.0.207:5432/all_products_db
APP_ENV=dev
APP_PORT=8000
ALLOWED_ORIGINS=http://localhost:5173,https://bunaciuni.local
SECRET_KEY=change-me

# apps/web/.env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Phase 1 — Database Modeling
We support beverages, foods, and activities under a common **products** table with category enums and optional fields.

### Entities
- **products** — core catalog
- **sources** — merchants/affiliates
- **product_images** — one or more images per product
- **price_history** — track old price, discounts, and validity windows
- **tags** — optional for filtering/SEO

### Schema (SQL)
```sql
CREATE TYPE product_category AS ENUM (
  'Ceva Bun de Baut',
  'Ceva Buna de Mancat',
  'Ceva Bun de Facut'
);

CREATE TABLE sources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  affiliate_url TEXT
);

CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category product_category NOT NULL,
  source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  old_price_cents INTEGER CHECK (old_price_cents >= 0),
  price_suffix TEXT,            -- e.g., 'lei/persoană'
  currency CHAR(3) DEFAULT 'RON',
  image_url TEXT,
  product_url TEXT,             -- canonical product page
  affiliate_url TEXT,           -- tracked link (overrides source.affiliate_url when present)
  available BOOLEAN DEFAULT TRUE,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_to TIMESTAMPTZ,
  rating NUMERIC(3,2),          -- optional
  attributes JSONB DEFAULT '{}',-- arbitrary extras
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_images (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INT DEFAULT 0
);

CREATE TABLE price_history (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  price_cents INTEGER NOT NULL,
  old_price_cents INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name CITEXT UNIQUE NOT NULL
);

CREATE TABLE product_tags (
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

CREATE INDEX products_category_idx ON products(category);
CREATE INDEX products_price_idx ON products(price_cents);
CREATE INDEX products_available_idx ON products(available);
```

**Notes**
- Prices stored as **cents** (integers) for precision; UI converts to RON.
- `price_suffix` allows per‑person or per‑kg notations.
- `valid_to` + `available` support scheduled expiry.

---

## Phase 2 — API Design (FastAPI)

### Endpoints
- `GET /health` — service health
- `GET /v1/categories` — returns the 3 categories
- `GET /v1/products` — list with filters
  - Query: `category`, `min_price`, `max_price`, `limit`, `offset`, `available=true`
- `GET /v1/products/random` — **random single product** matching filters
  - Query: `category` (required), `min_price`, `max_price`, `available=true`
  - Randomization strategy: uniform among matches; optional weighting by **freshness** and **discount**
- `GET /v1/products/{id}` — product by id
- `GET /v1/sources` — list sources (for admin/UIs)

### Random selection (weighted)
Weight = `1.0 + freshness_boost + discount_boost`
- `freshness_boost = clamp((now - created_at) <= 7 days ? 0.5 : (<=30 days ? 0.2 : 0.0), 0, 0.5)`
- `discount_boost = old_price_cents and price < old ? min( (old - price)/old, 0.5 ) : 0`

Implementation option:
- Fetch candidate IDs (`SELECT id, ... FROM products WHERE ... LIMIT 200`) then weighted pick in app.

### Example OpenAPI (subset)
```
GET /v1/products/random
200 {
  id: number,
  title: string,
  category: string,
  price_cents: number,
  old_price_cents?: number,
  price_suffix?: string,
  source: { name: string, url: string, affiliate_url?: string },
  image_url?: string,
  product_url?: string
}
```

---

## Phase 3 — Backend Implementation
**Steps**
1. Scaffold FastAPI app: `uvicorn apps.api.main:app --reload`
2. Add SQLAlchemy 2.0 models + pydantic schemas.
3. Alembic init + baseline migration using the SQL above.
4. CRUD repositories; service layer for filtering and random pick.
5. CORS config from `.env` `ALLOWED_ORIGINS`.
6. Seeds: insert `sources` and sample `products` (including the provided Escape Central item).
7. Unit tests for filtering and random selection distribution.

**Key Files**
```
apps/api/
  main.py
  core/config.py
  db/session.py
  db/migrations/
  models/{product.py, source.py, ...}
  schemas/{product.py, source.py}
  repositories/{product_repo.py}
  services/{product_service.py}
  routers/{products.py, sources.py, health.py}
  tests/
```

**Seeding (Python pseudo)**
```python
seed_products = [
  {
    "title": "Phantom of the Opera - Escape Room",
    "category": "Ceva Bun de Facut",
    "source": {"name": "Escape Central", "url": "https://escapecentral.ro"},
    "price_cents": 11000,
    "price_suffix": "lei/persoană",
    "image_url": "https://escapecentral.ro/wp-content/uploads/2025/09/Background4-450x450.jpg",
    "product_url": "https://escapecentral.ro",
  }
]
```

---

## Phase 4 — Frontend Implementation
**Goals**
- Keep the existing prototype aesthetic (glassmorphism, soft shadows, large radii).
- Connect to API for real data.
- Preserve the flow: Category → Budget Slider → Random Pick → CTA "Vezi toate bunăciunile".

**Pages/Routes**
- `/` — landing with 3 cards
- `/alege?c={category}` — budget step
- `/produs/{id}` — product details (optional)
- `/toate?c={category}&min=&max=` — listing page

**Data Hooks**
- `useCategories()` → static list
- `useRandomProduct(category, min, max)` → `GET /v1/products/random`
- `useProducts(category, min, max, pagination)` → `GET /v1/products`

**UI Details**
- Price formatting (RON) using `Intl.NumberFormat('ro-RO', { style:'currency', currency:'RON' })`
- Slider dual-handle (shadcn/ui `<Slider>` already integrated)
- Skeleton loaders for cards
- Error toasts (network issues)
- Deep-link preserve state via query params

**State**
- URL is the source of truth for selected category and budget
- Keep a small client cache of the last random result for back/forward nav

---

## Phase 5 — Admin & Content Ops (Optional Early)
- Minimal admin page (protected) to create/edit products and sources
- CSV importer (per-source mapping), image validation, link validation
- Bulk price updates & scheduled availability windows

---

## Phase 6 — Deployments
**Local dev**: `docker-compose up`
- `api` service connects to remote Postgres at `10.0.0.207`
- `web` served by Vite dev server, proxied via Nginx to avoid CORS hassles

**Staging/Prod**
- Nginx reverse proxy → `api` (uvicorn workers via `gunicorn -k uvicorn.workers.UvicornWorker -w 4`)
- Separate `web` static hosting (Nginx) or Vercel/Netlify (if allowed)
- HTTPS via Let’s Encrypt

**Docker Compose (excerpt)**
```yaml
services:
  api:
    build: ./apps/api
    env_file:
      - ./apps/api/.env
    ports: ["8000:8000"]
    command: uvicorn apps.api.main:app --host 0.0.0.0 --port 8000
  web:
    build: ./apps/web
    env_file:
      - ./apps/web/.env
    ports: ["5173:5173"]
    command: pnpm dev --host
```

---

## Phase 7 — QA & Testing
- **Backend**: pytest, coverage ≥ 85%, property-based tests for randomizer
- **Frontend**: vitest + React Testing Library, visual regression baselines
- **E2E**: Playwright flows for Category → Budget → Random → Listing

---

## Phase 8 — Security & Compliance
- Input validation (pydantic) and price bounds
- Strict CORS + rate limiting (slowapi) on `/random`
- Signed affiliate redirects (optional): `/go/:id?sig=...`
- Secrets via environment, never in code

---

## Phase 9 — Performance & Caching
- DB indexes listed above + `created_at` index if used in freshness weighting
- In‑memory cache (TTL 30s) for category counts and latest discounts
- CDN for product images (phase 2)

---

## Phase 10 — Analytics (Opt‑in, Privacy‑friendly)
- Page views + event: `random_product_shown`, `view_all_click`
- Record category/budget combination popularity (server-side, anonymized)

---

## API Spec (Detailed)
See `docs/api-spec.md` (to be generated) — includes request/response examples, error codes, and filter matrices.

**Quick examples**
```
GET /v1/products?category=Ceva%20Bun%20de%20Facut&min_price=5000&max_price=15000

GET /v1/products/random?category=Ceva%20Bun%20de%20Facut&min_price=5000&max_price=15000
→ 200 { id, title, category, price_cents, old_price_cents, price_suffix, image_url, source:{name,url,affiliate_url} }
```

---

## Migration Plan
1. Baseline migration (types + tables)
2. Seed `sources`
3. Seed `products` (include provided mock item)
4. Add `price_history` triggers (optional): on update to price fields, insert row

**Trigger example (optional)**
```sql
CREATE OR REPLACE FUNCTION log_price_change() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price_cents IS DISTINCT FROM OLD.price_cents OR NEW.old_price_cents IS DISTINCT FROM OLD.old_price_cents THEN
    INSERT INTO price_history(product_id, price_cents, old_price_cents, recorded_at)
    VALUES (NEW.id, NEW.price_cents, NEW.old_price_cents, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER price_change
AFTER UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION log_price_change();
```

---

## Rust (Yew) Alternative (Optional Track)
- **Frontend:** Yew + Trunk, Tailwind via wasm-friendly pipeline; use JS interop for Framer-like animations or rely on CSS transitions
- **Backend:** keep FastAPI or swap to **Rust axum** with sqlx + sea-orm
- Reuse the same API contract; only UI runtime changes

---

## Success Criteria (MVP)
- TTFB < 200ms on `/v1/products/random` with ≤50k products and indexed filters
- 3-category landing, working budget slider, correct RON formatting
- Random product card with image, source hyperlink (affiliate), price, old price (if any)
- "Vezi toate bunăciunile" opens list view with server-side filtering and pagination

---

## Next Steps
1. Initialize repo with the structure above
2. Create DB type + tables via Alembic
3. Seed the provided **Escape Central** example and a few beverages/foods
4. Wire the React prototype to `GET /v1/products/random`
5. Build the listing page and link the CTA

