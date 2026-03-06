import { and, eq, gte, lte } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { isAdmin } from '@/lib/auth';
import { parseCategory } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = parseCategory(searchParams.get('category'));
  const minPrice = Number(searchParams.get('minPrice') || 0);
  const maxPrice = Number(searchParams.get('maxPrice') || 999999999);
  const limit = Number(searchParams.get('limit') || 30);
  const offset = Number(searchParams.get('offset') || 0);
  const availableParam = searchParams.get('available');

  const filters = [gte(products.priceCents, minPrice), lte(products.priceCents, maxPrice)];
  if (category) filters.push(eq(products.category, category));
  if (availableParam !== null) filters.push(eq(products.available, availableParam === 'true'));

  const rows = await db.select().from(products).where(and(...filters)).limit(limit).offset(offset);
  return NextResponse.json({ products: rows });
}

export async function POST(request: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 });
  }

  const body = await request.json();
  const category = parseCategory(body.category);

  if (!body.title || !category || typeof body.priceCents !== 'number') {
    return NextResponse.json({ error: 'Date invalide' }, { status: 400 });
  }

  const result = db
    .insert(products)
    .values({
      title: body.title,
      description: body.description || null,
      category,
      priceCents: body.priceCents,
      oldPriceCents: body.oldPriceCents || null,
      priceSuffix: body.priceSuffix || null,
      currency: body.currency || 'RON',
      imageUrl: body.imageUrl || null,
      productUrl: body.productUrl || null,
      affiliateUrl: body.affiliateUrl || '#affiliate-placeholder',
      sourceName: body.sourceName || 'Ceva Bun',
      sourceUrl: body.sourceUrl || null,
      sourceType: body.sourceType || 'manual',
      available: body.available ?? true,
      rating: body.rating || null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      lat: body.lat || null,
      lng: body.lng || null,
    })
    .run();

  return NextResponse.json({ id: result.lastInsertRowid });
}
