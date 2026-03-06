export const dynamic = 'force-dynamic';

import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { products } from '@/db/schema';
import { money } from '@/lib/utils';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const product = await db.query.products.findFirst({ where: eq(products.id, id) });

  if (!product) {
    notFound();
  }

  const outboundUrl = product.affiliateUrl && !product.affiliateUrl.includes('placeholder')
    ? product.affiliateUrl
    : product.productUrl || '#';

  return (
    <main className="glass grid gap-6 p-6 md:grid-cols-[320px_1fr]">
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.title} className="h-80 w-full rounded-2xl object-cover" />
      ) : (
        <div className="h-80 w-full rounded-2xl bg-slate-700/40" />
      )}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{product.title}</h1>
        <div className="flex items-end gap-3">
          <p className="text-2xl font-bold text-emerald-300">{money(product.priceCents, product.currency || 'RON')}</p>
          {product.oldPriceCents ? (
            <p className="text-slate-400 line-through">{money(product.oldPriceCents, product.currency || 'RON')}</p>
          ) : null}
        </div>
        {product.description ? <p className="text-slate-200/90">{product.description}</p> : null}
        <p className="text-sm text-slate-300">Sursă: {product.sourceName || 'Ceva Bun'}</p>
        <a
          href={outboundUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
        >
          Mergi la ofertă →
        </a>
      </div>
    </main>
  );
}
