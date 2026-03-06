import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { isAdmin } from '@/lib/auth';
import { parseCategory } from '@/lib/utils';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const product = await db.query.products.findFirst({ where: eq(products.id, id) });

  if (!product) {
    return NextResponse.json({ error: 'Produs inexistent' }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 });
  }

  const id = Number(params.id);
  const body = await request.json();
  const category = parseCategory(body.category);

  if (!body.title || !category || typeof body.priceCents !== 'number') {
    return NextResponse.json({ error: 'Date invalide' }, { status: 400 });
  }

  db.update(products)
    .set({
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
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(products.id, id))
    .run();

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 });
  }

  db.delete(products).where(eq(products.id, Number(params.id))).run();
  return NextResponse.json({ ok: true });
}
