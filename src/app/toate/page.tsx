export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { and, count, eq, gte, lte } from 'drizzle-orm';
import { ProductCard } from '@/components/ProductCard';
import { db } from '@/db';
import { products } from '@/db/schema';
import { parseCategory } from '@/lib/utils';

export default async function ToatePage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const category = parseCategory(searchParams.c || null);
  const min = Number(searchParams.min || 0);
  const max = Number(searchParams.max || 99999999);
  const page = Math.max(1, Number(searchParams.page || 1));
  const limit = 12;
  const offset = (page - 1) * limit;

  const filters = [gte(products.priceCents, min), lte(products.priceCents, max), eq(products.available, true)];
  if (category) filters.push(eq(products.category, category));

  const items = await db.select().from(products).where(and(...filters)).limit(limit).offset(offset);
  const [{ total }] = await db.select({ total: count() }).from(products).where(and(...filters));

  return (
    <main className="space-y-6">
      <section className="glass p-6">
        <h1 className="text-3xl font-bold">Toate bunăciunile</h1>
        <p className="mt-2 text-sm text-slate-300">Filtrare după categorie și preț în query string.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </section>
      <section className="flex items-center justify-between">
        <p className="text-sm text-slate-300">Total rezultate: {total}</p>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link href={`/toate?c=${category || ''}&min=${min}&max=${max}&page=${page - 1}`} className="rounded-lg border border-white/30 px-3 py-1 text-sm">
              Înapoi
            </Link>
          ) : null}
          {offset + limit < total ? (
            <Link href={`/toate?c=${category || ''}&min=${min}&max=${max}&page=${page + 1}`} className="rounded-lg border border-white/30 px-3 py-1 text-sm">
              Înainte
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
