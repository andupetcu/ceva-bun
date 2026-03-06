const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export type Source = { id?: number; name: string; url?: string; affiliate_url?: string }
export type Product = {
  id: number
  title: string
  description?: string
  category: string
  price_cents: number
  old_price_cents?: number
  price_suffix?: string
  currency?: string
  image_url?: string
  product_url?: string
  affiliate_url?: string
  available?: boolean
  rating?: number
  source?: Source
}

export async function getCategories(): Promise<string[]> {
  const r = await fetch(`${BASE}/v1/categories`)
  if (!r.ok) throw new Error('Failed to load categories')
  return r.json()
}

export async function getRandomProduct(params: {
  category: string
  min_price?: number
  max_price?: number
}): Promise<Product> {
  const q = new URLSearchParams()
  q.set('category', params.category)
  if (params.min_price != null) q.set('min_price', String(params.min_price))
  if (params.max_price != null) q.set('max_price', String(params.max_price))
  const r = await fetch(`${BASE}/v1/products/random?${q}`)
  if (!r.ok) throw new Error('Not found')
  return r.json()
}

export async function getProducts(params: {
  category?: string
  min_price?: number
  max_price?: number
  limit?: number
  offset?: number
}): Promise<{ items: Product[]; total: number }> {
  const q = new URLSearchParams()
  if (params.category) q.set('category', params.category)
  if (params.min_price != null) q.set('min_price', String(params.min_price))
  if (params.max_price != null) q.set('max_price', String(params.max_price))
  if (params.limit != null) q.set('limit', String(params.limit))
  if (params.offset != null) q.set('offset', String(params.offset))
  const r = await fetch(`${BASE}/v1/products?${q}`)
  if (!r.ok) throw new Error('Failed to load products')
  return r.json()
}

export function formatRON(cents: number) {
  const value = cents / 100
  try {
    return new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(value)
  } catch {
    return `${value.toFixed(2)} RON`
  }
}
