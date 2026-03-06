import { and, eq, gte, lte } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { parseCategory } from '@/lib/utils';

function pickWeighted<T extends { createdAt: string | null; priceCents: number; oldPriceCents: number | null }>(items: T[]) {
  const now = Date.now();

  const weighted = items.map((item) => {
    const created = item.createdAt ? new Date(item.createdAt).getTime() : now;
    const ageDays = Math.max(1, (now - created) / (1000 * 60 * 60 * 24));
    const freshness = Math.max(0.1, 14 / ageDays);
    const discount = item.oldPriceCents && item.oldPriceCents > item.priceCents
      ? (item.oldPriceCents - item.priceCents) / item.oldPriceCents
      : 0;

    return {
      item,
      weight: 1 + freshness + discount * 2,
    };
  });

  const totalWeight = weighted.reduce((acc, it) => acc + it.weight, 0);
  let threshold = Math.random() * totalWeight;

  for (const entry of weighted) {
    threshold -= entry.weight;
    if (threshold <= 0) {
      return entry.item;
    }
  }

  return weighted.at(-1)?.item ?? null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = parseCategory(searchParams.get('category'));
  const minPrice = Number(searchParams.get('minPrice') || 0);
  const maxPrice = Number(searchParams.get('maxPrice') || 999999999);

  const filters = [
    gte(products.priceCents, minPrice),
    lte(products.priceCents, maxPrice),
    eq(products.available, true),
  ];

  if (category) filters.push(eq(products.category, category));

  const rows = await db.select().from(products).where(and(...filters));

  if (rows.length === 0) {
    return NextResponse.json({ product: null });
  }

  const product = pickWeighted(rows);
  return NextResponse.json({ product });
}
