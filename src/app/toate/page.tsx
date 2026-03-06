export const dynamic = 'force-dynamic';

import { and, count, eq, gte, lte, like } from 'drizzle-orm';
import { db } from '@/db';
import { products } from '@/db/schema';
import { parseCategory } from '@/lib/utils';
import { FilteredListing } from '@/components/FilteredListing';

export default async function ToatePage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const category = parseCategory(searchParams.c || null);
  const min = Number(searchParams.min || 0);
  const max = Number(searchParams.max || 99999999);
  const city = searchParams.city || null;
  const page = Math.max(1, Number(searchParams.page || 1));
  const limit = 12;
  const offset = (page - 1) * limit;

  const filters = [gte(products.priceCents, min), lte(products.priceCents, max), eq(products.available, true)];
  if (category) filters.push(eq(products.category, category));
  if (city) filters.push(like(products.tags, `%"${city}"%`));

  const items = await db.select().from(products).where(and(...filters)).limit(limit).offset(offset);
  const [{ total }] = await db.select({ total: count() }).from(products).where(and(...filters));

  // Get all unique cities from tags for the filter dropdown
  const allProducts = await db.select({ tags: products.tags }).from(products).where(eq(products.available, true));
  const cityTags = new Set<string>();
  const knownCities = ['bucharest', 'bucuresti', 'cluj', 'timisoara', 'iasi', 'brasov', 'sibiu', 'constanta', 'craiova', 'oradea', 'galati', 'ploiesti', 'arad', 'pitesti', 'romania', 'transilvania'];
  for (const row of allProducts) {
    const tags = (row.tags as string[]) || [];
    for (const tag of tags) {
      if (knownCities.includes(tag.toLowerCase())) {
        cityTags.add(tag);
      }
    }
  }

  return (
    <FilteredListing
      items={items}
      total={total}
      page={page}
      limit={limit}
      category={category}
      min={min}
      max={max}
      city={city}
      cities={Array.from(cityTags).sort()}
    />
  );
}
