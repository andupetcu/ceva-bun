import { count, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { categories, products } from '@/db/schema';
import { categoryLabels } from '@/lib/utils';

export async function GET() {
  const result = await Promise.all(
    categories.map(async (category) => {
      const [{ total }] = await db
        .select({ total: count() })
        .from(products)
        .where(eq(products.category, category));

      return {
        id: category,
        title: categoryLabels[category],
        count: total,
      };
    }),
  );

  return NextResponse.json({ categories: result });
}
