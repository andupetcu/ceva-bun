import { Product } from '../lib/api'
import { formatRON } from '../lib/api'

export function ProductCard({ p }: { p: Product }) {
  return (
    <div className="glass rounded-3xl p-5 flex gap-4">
      {p.image_url && (
        <img src={p.image_url} alt={p.title} className="w-28 h-28 object-cover rounded-2xl" />
      )}
      <div className="flex-1">
        <div className="text-lg font-semibold">{p.title}</div>
        <div className="text-sm opacity-80">{p.category}</div>
        <div className="mt-2 text-xl">
          <span className="font-bold">{formatRON(p.price_cents)}</span>
          {p.price_suffix && <span className="ml-2 opacity-80">{p.price_suffix}</span>}
          {p.old_price_cents && (
            <span className="ml-3 line-through opacity-60">{formatRON(p.old_price_cents)}</span>
          )}
        </div>
        {p.source?.name && (
          <a
            className="mt-2 inline-block text-sky-300 hover:text-sky-200 text-sm"
            href={p.affiliate_url || p.product_url || p.source?.url}
            target="_blank" rel="noreferrer"
          >
            {p.source?.name} ↗
          </a>
        )}
      </div>
    </div>
  )
}
