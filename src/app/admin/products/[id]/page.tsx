export const dynamic = 'force-dynamic';

import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { AdminProductForm } from '@/components/AdminProductForm';
import { db } from '@/db';
import { products } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';

export default async function AdminEditProductPage({ params }: { params: { id: string } }) {
  requireAdmin();
  const item = await db.query.products.findFirst({ where: eq(products.id, Number(params.id)) });

  if (!item) {
    notFound();
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Editează produs</h1>
      <AdminProductForm initial={item} />
    </section>
  );
}
