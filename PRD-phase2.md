# Ceva Bun — Phase 2 Features PRD

## Context
- Next.js 14 + App Router + TypeScript + Tailwind + SQLite (better-sqlite3) + Drizzle ORM
- 3,000 products across 6 categories, 500 de_facut activities with lat/lon from OSM
- Already has: Leaflet map on `/harta`, Umami analytics at analytics.noru1.ro
- Glassmorphism UI, dark mode default, Romanian language

## Feature 1: Search on /toate
- Add search bar at top of `/toate` page
- Client-side search filtering (already loads products dynamically)
- Search across title, description, sourceName
- Debounced input (300ms)
- Show result count
- Clear button (×)
- Works alongside existing category/price filters

## Feature 2: PWA Setup
- Add `manifest.json` in `/public` with Romanian metadata:
  - name: "Ceva Bun"
  - short_name: "CevaBun"
  - theme_color: #0f172a
  - background_color: #0f172a
  - display: standalone
  - start_url: /
  - icons: generate from existing brand (use simple emoji-based icon or create SVG)
- Add `<link rel="manifest">` in layout.tsx
- Add service worker for basic offline caching (next-pwa or manual)
- Add meta tags: apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style

## Feature 3: Umami Affiliate Click Tracking
- When user clicks "Mergi la ofertă" / "Vezi oferta" button, fire Umami event BEFORE navigating
- Event name: `affiliate-click`
- Event data: { category, productId, sourceName, priceCents }
- Implementation: wrap the CTA `<a>` in an onClick handler that calls `umami.track()`
- Reference: `window.umami.track('affiliate-click', { ... })`
- The Umami script is already loaded (website ID: 2a4e7fc4-58d3-44fc-9d4e-7e1c80c90b7d)

## Feature 4: Map with All 500 de_facut Activities + Clustering
- Current `/harta` page shows a basic map. Upgrade it:
- Load ALL de_facut products (they have lat/lon in tags or in the DB)
- Note: lat/lon are stored in the seed JSON but may not be in the DB schema. If not in schema, add `lat` and `lon` REAL columns to the products table.
- Use Leaflet.markercluster for clustering (install `leaflet.markercluster` + types)
- Each marker popup shows: name, type emoji, city, price, link to product page
- Color-code markers by activity type (museum=blue, theatre=red, escape=green, etc.)
- Zoom to Romania bounds on load: [[43.5, 20.2], [48.3, 30.0]]
- Responsive: full viewport height minus header

## Technical Notes
- DB schema at `src/db/schema.ts`, exports `products` table
- DB init at `src/db/index.ts`
- Seed data at `data/seed-products.json` — de_facut items have `lat` and `lon` fields
- Map component at `src/components/MapView.tsx` (client component with 'use client')
- Product detail page at `src/app/produs/[id]/page.tsx`
- Listing page at `src/app/toate/page.tsx` with `FilteredListing` component
- Layout at `src/app/layout.tsx` (already has Umami script loaded)
- Package manager: pnpm
- Build must pass: `pnpm run build`

## Acceptance Criteria
1. Search on /toate filters products in real-time, works with other filters
2. Site installable as PWA on mobile (manifest + service worker)
3. Clicking any affiliate link fires Umami event with product metadata
4. Map page shows 500 clustered markers, clicking reveals activity details
5. All existing functionality preserved
6. Build passes clean
