# Ceva Bun API Spec (MVP)

Base URL: `http://localhost:8000`

- `GET /health` → `{ status: "ok" }`
- `GET /v1/categories` → `["Ceva Bun de Baut", "Ceva Buna de Mancat", "Ceva Bun de Facut"]`
- `GET /v1/products` (query: `category?, min_price?, max_price?, limit?, offset?, available?`) → `{ items: Product[], total: number }`
- `GET /v1/products/random` (query: `category`, `min_price?`, `max_price?`, `available?`) → `Product`
- `GET /v1/products/{id}` → `Product`
- `GET /v1/sources` → `Source[]`

Types:

Product:
```
{
  id: number,
  title: string,
  description?: string,
  category: string,
  price_cents: number,
  old_price_cents?: number,
  price_suffix?: string,
  currency?: string,
  image_url?: string,
  product_url?: string,
  affiliate_url?: string,
  available?: boolean,
  rating?: number,
  source?: { id?: number, name: string, url?: string, affiliate_url?: string }
}
```
