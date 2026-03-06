'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BudgetSlider } from '@/components/BudgetSlider';
import { AffiliateLink } from '@/components/AffiliateLink';
import { categoryLabels, money } from '@/lib/utils';
import type { ProductCategory } from '@/db/schema';

type Product = {
  id: number;
  title: string;
  imageUrl: string | null;
  description: string | null;
  category: string;
  priceCents: number;
  oldPriceCents: number | null;
  currency: string | null;
  affiliateUrl: string | null;
  productUrl: string | null;
  sourceName: string | null;
};

export default function AlegePage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const category = (searchParams.c || 'bagat_in_gura') as ProductCategory;
  const [minPrice, setMinPrice] = useState(1000);
  const [maxPrice, setMaxPrice] = useState(200000);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  const query = useMemo(
    () => `/api/products/random?category=${category}&minPrice=${minPrice}&maxPrice=${maxPrice}`,
    [category, minPrice, maxPrice],
  );

  const getRandom = async () => {
    setLoading(true);
    const response = await fetch(query, { cache: 'no-store' });
    const data = await response.json();
    setProduct(data.product ?? null);
    setLoading(false);
  };

  useEffect(() => {
    getRandom();
  }, [query]);

  return (
    <main className="space-y-6">
      <section className="glass p-6">
        <h1 className="text-3xl font-bold">{categoryLabels[category]}</h1>
        <p className="mt-2 text-sm text-slate-300">Alege intervalul de buget și vezi o recomandare random.</p>
        <div className="mt-6">
          <BudgetSlider min={500} max={300000} valueMin={minPrice} valueMax={maxPrice} onMinChange={setMinPrice} onMaxChange={setMaxPrice} />
        </div>
        <div className="mt-2 flex gap-2 text-sm">
          <span>Minim: {money(minPrice)}</span>
          <span>•</span>
          <span>Maxim: {money(maxPrice)}</span>
        </div>
      </section>

      <section className="glass p-6">
        {loading ? <p>Se caută ceva bun...</p> : null}
        {!loading && !product ? <p>Nu am găsit produse în acest buget.</p> : null}
        {!loading && product ? (
          <div className="grid gap-5 md:grid-cols-[260px_1fr]">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.title} className="h-64 w-full rounded-2xl object-cover" />
            ) : (
              <div className="h-64 rounded-2xl bg-slate-700/40" />
            )}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">{product.title}</h2>
              <p className="text-lg text-emerald-300">{money(product.priceCents, product.currency || 'RON')}</p>
              {product.oldPriceCents ? (
                <p className="text-sm text-slate-400 line-through">{money(product.oldPriceCents, product.currency || 'RON')}</p>
              ) : null}
              {product.description ? <p className="text-slate-200/90">{product.description}</p> : null}
              <div className="flex flex-wrap gap-3 pt-2">
                <AffiliateLink
                  href={product.affiliateUrl && !product.affiliateUrl.includes('placeholder') ? product.affiliateUrl : (product.productUrl || '#')}
                  category={product.category}
                  productId={product.id}
                  sourceName={product.sourceName}
                  priceCents={product.priceCents}
                  className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
                >
                  Vezi oferta
                </AffiliateLink>
                <button onClick={getRandom} className="rounded-xl border border-white/30 px-4 py-2">
                  Arată-mi altceva
                </button>
                <Link href={`/toate?c=${category}&min=${minPrice}&max=${maxPrice}`} className="rounded-xl border border-cyan-300/50 px-4 py-2 text-cyan-200">
                  Vezi toate bunăciunile
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
