import Link from 'next/link';
import type { Product } from '@/db/schema';
import { categoryLabels, money } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="glass overflow-hidden">
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.title} className="h-48 w-full object-cover" />
      ) : (
        <div className="h-48 w-full bg-slate-700/40" />
      )}
      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wider text-cyan-200 light:text-cyan-800">
          {categoryLabels[product.category]}
        </p>
        <h3 className="line-clamp-2 text-lg font-semibold">{product.title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-emerald-300 light:text-emerald-700">
            {money(product.priceCents, product.currency || 'RON')}
          </span>
          {product.oldPriceCents ? (
            <span className="text-sm text-slate-400 line-through">
              {money(product.oldPriceCents, product.currency || 'RON')}
            </span>
          ) : null}
        </div>
        <Link href={`/produs/${product.id}`} className="inline-block text-sm font-medium text-cyan-300 underline">
          Vezi detalii
        </Link>
      </div>
    </article>
  );
}
