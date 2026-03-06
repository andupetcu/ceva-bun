import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts, Product } from '../lib/api'
import { ProductCard } from '../components/ProductCard'

export function Listing() {
  const [sp, setSp] = useSearchParams()
  const category = sp.get('c') || undefined
  const min = sp.get('min') ? parseInt(sp.get('min')!) : undefined
  const max = sp.get('max') ? parseInt(sp.get('max')!) : undefined
  const [items, setItems] = useState<Product[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    getProducts({ category, min_price: min, max_price: max, limit: 50 }).then((r) => {
      setItems(r.items)
      setTotal(r.total)
    })
  }, [category, min, max])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold">Toate bunăciunile {category ? `— ${category}` : ''}</h2>
      <div className="opacity-70 text-sm mt-1">{total} rezultate</div>
      <div className="mt-6 grid gap-4">
        {items.map((p) => (
          <ProductCard p={p} key={p.id} />
        ))}
      </div>
    </div>
  )
}

