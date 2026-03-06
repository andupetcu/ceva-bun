'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/db/schema';

const categoryLabels: Record<string, string> = {
  baut: '🍷 De Băut',
  mancat: '🍕 De Mâncat',
  facut: '🎯 De Făcut',
};

export function FilteredListing({
  items,
  total,
  page,
  limit,
  category,
  min,
  max,
  city,
  cities,
}: {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  category: string | null;
  min: number;
  max: number;
  city: string | null;
  cities: string[];
}) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const [selectedCity, setSelectedCity] = useState(city || '');
  const [minPrice, setMinPrice] = useState(min > 0 ? String(min / 100) : '');
  const [maxPrice, setMaxPrice] = useState(max < 99999999 ? String(max / 100) : '');

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('c', selectedCategory);
    if (selectedCity) params.set('city', selectedCity);
    if (minPrice) params.set('min', String(Number(minPrice) * 100));
    if (maxPrice) params.set('max', String(Number(maxPrice) * 100));
    router.push(`/toate?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedCity('');
    setMinPrice('');
    setMaxPrice('');
    router.push('/toate');
  };

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (category) params.set('c', category);
    if (city) params.set('city', city);
    if (min > 0) params.set('min', String(min));
    if (max < 99999999) params.set('max', String(max));
    params.set('page', String(p));
    return `/toate?${params.toString()}`;
  };

  const offset = (page - 1) * limit;

  return (
    <main className="space-y-6">
      <section className="glass p-6">
        <h1 className="text-3xl font-bold">Toate bunăciunile</h1>
        <p className="mt-2 text-sm text-slate-300">
          {total} {total === 1 ? 'rezultat' : 'rezultate'}
          {category ? ` în ${categoryLabels[category] || category}` : ''}
          {city ? ` · ${city}` : ''}
        </p>
      </section>

      {/* Filters */}
      <section className="glass p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Categorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm backdrop-blur-sm"
            >
              <option value="">Toate</option>
              <option value="baut">🍷 De Băut</option>
              <option value="mancat">🍕 De Mâncat</option>
              <option value="facut">🎯 De Făcut</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Oraș</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm backdrop-blur-sm"
            >
              <option value="">Toate</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Preț min (RON)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="w-24 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm backdrop-blur-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Preț max (RON)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="∞"
              className="w-24 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm backdrop-blur-sm"
            />
          </div>

          <button
            type="button"
            onClick={applyFilters}
            className="rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            Filtrează
          </button>

          {(selectedCategory || selectedCity || minPrice || maxPrice) && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              Resetează
            </button>
          )}
        </div>
      </section>

      {/* Products grid */}
      <section className="grid gap-4 md:grid-cols-3">
        {items.length > 0 ? (
          items.map((item) => <ProductCard key={item.id} product={item} />)
        ) : (
          <div className="col-span-full glass p-8 text-center">
            <p className="text-lg">Nu am găsit nimic pe filtrele selectate 😔</p>
            <button onClick={clearFilters} className="mt-3 text-sm underline opacity-70 hover:opacity-100">
              Resetează filtrele
            </button>
          </div>
        )}
      </section>

      {/* Pagination */}
      <section className="flex items-center justify-between">
        <p className="text-sm text-slate-300">
          {offset + 1}–{Math.min(offset + limit, total)} din {total}
        </p>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={buildPageUrl(page - 1)} className="rounded-lg border border-white/30 px-3 py-1 text-sm hover:bg-white/10 transition-colors">
              ← Înapoi
            </Link>
          )}
          {offset + limit < total && (
            <Link href={buildPageUrl(page + 1)} className="rounded-lg border border-white/30 px-3 py-1 text-sm hover:bg-white/10 transition-colors">
              Înainte →
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
