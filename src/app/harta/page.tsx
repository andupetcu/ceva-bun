export const dynamic = 'force-dynamic';

import { and, eq, isNotNull } from 'drizzle-orm';
import { MapView } from '@/components/MapView';
import { db } from '@/db';
import { products } from '@/db/schema';

export default async function HartaPage() {
  const items = await db
    .select({ id: products.id, title: products.title, lat: products.lat, lng: products.lng })
    .from(products)
    .where(and(eq(products.category, 'de_facut'), isNotNull(products.lat), isNotNull(products.lng)));

  const pins = items.map((item) => ({
    id: item.id,
    title: item.title,
    lat: item.lat || 0,
    lng: item.lng || 0,
  }));

  return (
    <main className="space-y-5">
      <section className="glass p-6">
        <h1 className="text-3xl font-bold">Hartă cu activități</h1>
        <p className="mt-2 text-sm text-slate-300">Locuri și experiențe selectate în zona București.</p>
      </section>
      <MapView pins={pins} />
    </main>
  );
}
