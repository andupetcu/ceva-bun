# PRD — Ceva Bun v2 (Full Rebuild)

**Owner:** Andrei Petcu
**Date:** 2026-03-06
**Status:** Ready for implementation

---

## 1. Vision

**Ceva Bun** is a curated product discovery app for the Romanian market. Users pick a category, set a budget, and get a random hand-picked suggestion — drink, food, or activity. Think "the good stuff, picked for you."

Monetization: affiliate links via 2Performant.

## 2. Stack Decision — Next.js Monolith

**Drop the FastAPI + separate React setup.** Rebuild as a **Next.js 14+ App Router monolith**:

- **Framework:** Next.js 14+ (App Router, Server Components, API Routes)
- **Styling:** TailwindCSS + glassmorphism aesthetic (preserve the existing vibe)
- **DB:** SQLite via better-sqlite3 (simple, no external DB dependency, file-based)
- **ORM:** Drizzle ORM (lightweight, type-safe, works great with SQLite)
- **Maps:** OpenStreetMap tiles + Overpass API for POI queries
- **Map UI:** Leaflet.js via react-leaflet
- **Auth (admin):** Simple password-protected admin route (env var `ADMIN_PASSWORD`)
- **Deployment:** Single Docker container, deployable anywhere

**Why the change:**
- Andrei's preference for Next.js monoliths
- One service to deploy instead of two
- Admin panel in the same app
- API routes handle everything the FastAPI did
- SQLite = zero infrastructure, file backup, fast reads

## 3. Categories (3)

1. 🍷 **Ceva Bun de Băut** — drinks (wines, spirits, craft beer, coffee, tea)
2. 🍕 **Ceva Bun de Mâncat** — food (restaurants, gourmet products, delivery, specialty)
3. 🎯 **Ceva Bun de Făcut** — activities (escape rooms, experiences, events, local places)

## 4. Data Sources

### 4a. Affiliate Products (~500 curated) — PRIMARY

Source: **2Performant** affiliate network (Romania's largest).

The existing inpromotie.ro project already syncs 12 2Performant feeds daily into Meilisearch (3.8M products). We'll query that index to seed Ceva Bun.

**For MVP, use a static seed file** (`data/seed-products.json`) with ~50 hand-picked sample products across all 3 categories. The nightly 2Performant sync pipeline is Phase 2.

Product schema:
```json
{
  "title": "string",
  "description": "string (optional)",
  "category": "baut|mancat|facut",
  "priceCents": 11000,
  "oldPriceCents": 15000,
  "priceSuffix": "lei/persoană",
  "currency": "RON",
  "imageUrl": "https://...",
  "productUrl": "https://...",
  "affiliateUrl": "https://...",
  "sourceName": "Escape Central",
  "sourceUrl": "https://escapecentral.ro",
  "available": true,
  "rating": 4.5,
  "tags": ["escape-room", "bucharest"],
  "source_type": "affiliate"
}
```

### 4b. Map-Based Activities (Overpass API) — for "de Făcut"

Query OpenStreetMap Overpass API for nearby POIs:
- Restaurants, cafes, bars
- Museums, theatres, escape rooms
- Parks, hiking trails
- Events venues

These enrich the "Ceva Bun de Făcut" category with location-based suggestions.

**MVP:** Pre-fetch POIs for Bucharest area and store in SQLite. Show on a Leaflet map.

### 4c. Admin + User Submissions

- Admin can add/edit/delete products manually
- Users can submit suggestions via a simple form
- Submissions go to a review queue (admin approves/rejects)

## 5. Pages & Routes

### Public

| Route | Description |
|---|---|
| `/` | Landing — 3 category cards with glassmorphism style |
| `/alege?c={category}` | Budget slider → shows random product |
| `/produs/{id}` | Product detail (image, price, affiliate CTA) |
| `/toate?c={category}&min=&max=` | Full listing with filters |
| `/sugereaza` | User submission form |
| `/harta?c=facut` | Map view for "de Făcut" (Leaflet + OSM) |

### Admin (`/admin/*`)

| Route | Description |
|---|---|
| `/admin` | Login (simple password from env) |
| `/admin/products` | Product list with CRUD |
| `/admin/products/new` | Add product form |
| `/admin/products/{id}/edit` | Edit product |
| `/admin/submissions` | Review queue for user submissions |

## 6. API Routes (`/api/*`)

| Endpoint | Method | Description |
|---|---|---|
| `/api/categories` | GET | Returns the 3 categories with counts |
| `/api/products` | GET | List with filters: `category`, `minPrice`, `maxPrice`, `limit`, `offset`, `available` |
| `/api/products/random` | GET | Random product matching filters (weighted by freshness + discount) |
| `/api/products/{id}` | GET | Single product |
| `/api/products` | POST | Admin: create product |
| `/api/products/{id}` | PUT | Admin: update product |
| `/api/products/{id}` | DELETE | Admin: delete product |
| `/api/submissions` | POST | User: submit suggestion |
| `/api/admin/submissions` | GET | Admin: list pending submissions |
| `/api/admin/submissions/{id}` | PATCH | Admin: approve/reject |
| `/api/overpass` | GET | Proxy for Overpass API queries (cache results) |

## 7. Database Schema (Drizzle + SQLite)

```typescript
// Products table
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category', { enum: ['baut', 'mancat', 'facut'] }).notNull(),
  priceCents: integer('price_cents').notNull(),
  oldPriceCents: integer('old_price_cents'),
  priceSuffix: text('price_suffix'),
  currency: text('currency').default('RON'),
  imageUrl: text('image_url'),
  productUrl: text('product_url'),
  affiliateUrl: text('affiliate_url'),
  sourceName: text('source_name'),
  sourceUrl: text('source_url'),
  sourceType: text('source_type', { enum: ['affiliate', 'map', 'manual', 'user'] }).default('manual'),
  available: integer('available', { mode: 'boolean' }).default(true),
  rating: real('rating'),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  lat: real('lat'),
  lng: real('lng'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// User submissions
export const submissions = sqliteTable('submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category', { enum: ['baut', 'mancat', 'facut'] }).notNull(),
  suggestedPrice: integer('suggested_price'),
  url: text('url'),
  submitterName: text('submitter_name'),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending'),
  adminNotes: text('admin_notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
```

## 8. UI/UX Design

- **Glassmorphism aesthetic** — frosted glass cards, soft shadows, large border-radius
- **Apple-style** — clean, spacious, premium feel
- **Dark mode default** with light mode toggle
- **Romanian language** UI (all text in Romanian)
- **Mobile-first** responsive design
- **Animations:** Framer Motion for card transitions, skeleton loaders
- **Price format:** `Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' })`
- **Budget slider:** Dual-handle range slider (min/max)

### Landing Page Cards (3)
Each card:
- Category icon + title
- Gradient glassmorphism background
- Hover scale effect
- "Alege un buget și îți sugerăm ceva bun." subtitle

### Random Product View
- Large product image
- Title + price (with old price strikethrough if discounted)
- Source badge + affiliate CTA button
- "Arată-mi altceva" (show me something else) button
- "Vezi toate bunăciunile" link to listing

## 9. Seed Data

Create `data/seed-products.json` with ~50 sample products:

### Băut (drinks) — ~15-20 items
- Romanian wines (Cramele Recaș, Jidvei, Budureasca)
- Craft beers (Zaganu, Ground Zero, Hop Hooligans)
- Specialty coffee, tea, spirits (țuică, palincă)
- Price range: 15-500 RON

### Mâncat (food) — ~15-20 items
- Restaurant experiences (fine dining Bucharest)
- Gourmet products (artisan cheese, honey, cured meats)
- Food boxes/subscriptions
- Traditional Romanian food products
- Price range: 20-800 RON

### Făcut (activities) — ~15-20 items
- Escape rooms (Escape Central, Captive, etc.)
- Cultural experiences (theater, opera, museum passes)
- Outdoor activities (hiking trips, Via Ferrata)
- Workshops (pottery, cooking classes, wine tasting)
- Price range: 50-1500 RON

Use realistic Romanian products with real names, approximate prices, and placeholder image URLs. Include affiliate URLs as `#affiliate-placeholder`.

## 10. Implementation Order

### Phase 1 — Core MVP (THIS PR)
1. Initialize Next.js 14 with App Router, Tailwind, TypeScript
2. Set up Drizzle + SQLite (`db/ceva-bun.db`)
3. Create schema + migrations
4. Seed with sample data
5. Build all public pages (Landing, Budget/Random, Listing, Product Detail)
6. Build API routes
7. Build admin panel (CRUD + submissions review)
8. Build user submission form
9. Basic Leaflet map for "de Făcut" items with lat/lng
10. Docker build

### Phase 2 — Data Pipeline (LATER, not this PR)
- 2Performant feed sync from Meilisearch
- Overpass API POI fetcher
- Nightly cron job

## 11. File Structure

```
ceva-bun/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Landing
│   │   ├── alege/page.tsx              # Budget + Random
│   │   ├── produs/[id]/page.tsx        # Product detail
│   │   ├── toate/page.tsx              # Listing
│   │   ├── sugereaza/page.tsx          # User submission
│   │   ├── harta/page.tsx              # Map view
│   │   ├── admin/
│   │   │   ├── layout.tsx              # Auth wrapper
│   │   │   ├── page.tsx                # Dashboard
│   │   │   ├── products/page.tsx       # Product list
│   │   │   ├── products/new/page.tsx   # Add product
│   │   │   ├── products/[id]/page.tsx  # Edit product
│   │   │   └── submissions/page.tsx    # Review queue
│   │   └── api/
│   │       ├── categories/route.ts
│   │       ├── products/route.ts
│   │       ├── products/random/route.ts
│   │       ├── products/[id]/route.ts
│   │       ├── submissions/route.ts
│   │       ├── admin/submissions/route.ts
│   │       └── admin/submissions/[id]/route.ts
│   ├── components/
│   │   ├── ProductCard.tsx
│   │   ├── BudgetSlider.tsx
│   │   ├── CategoryCard.tsx
│   │   ├── MapView.tsx
│   │   └── SubmissionForm.tsx
│   ├── db/
│   │   ├── index.ts                    # Drizzle client
│   │   ├── schema.ts                   # Tables
│   │   └── seed.ts                     # Seed script
│   └── lib/
│       ├── utils.ts
│       └── overpass.ts                 # Overpass API client
├── data/
│   └── seed-products.json              # 50 sample products
├── drizzle.config.ts
├── Dockerfile
├── docker-compose.yml
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

## 12. Environment Variables

```env
ADMIN_PASSWORD=change-me
DATABASE_URL=file:./db/ceva-bun.db
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

## 13. Acceptance Criteria

- [ ] Landing page with 3 glassmorphism category cards
- [ ] Budget slider that filters products by price range
- [ ] Random product suggestion with "show me another" button
- [ ] Full listing page with category + price filters + pagination
- [ ] Product detail page with affiliate CTA
- [ ] Admin panel with login, product CRUD, submission review
- [ ] User can submit suggestions
- [ ] Map view showing "de Făcut" items on Leaflet/OSM
- [ ] 50 seed products across 3 categories
- [ ] SQLite database with Drizzle migrations
- [ ] Romanian language UI throughout
- [ ] Mobile responsive
- [ ] Dark mode default
- [ ] Docker build working
- [ ] All API routes functional

## 14. Non-Goals (for this PR)

- No 2Performant API integration (static seed data for now)
- No nightly sync pipeline
- No user authentication (only admin password)
- No payment processing
- No SEO optimization (Phase 2)
- No analytics (Phase 2)

## 15. Notes

- The existing FastAPI + React code in `apps/` is reference only — we're rebuilding from scratch as Next.js
- Keep the glassmorphism aesthetic from the original UI
- All Romanian text — no English UI strings
- Prices in bani (cents), display in RON
- The old `apps/` directory can be deleted after the rebuild
