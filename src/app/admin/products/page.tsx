export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { desc } from 'drizzle-orm';
import { AdminProductActions } from '@/components/AdminProductActions';
import { db } from '@/db';
import { products } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { money } from '@/lib/utils';

export default async function AdminProductsPage() {
  requireAdmin();
  const items = await db.select().from(products).orderBy(desc(products.id));

  return (
    <section className="glass p-6">
      <h1 className="mb-4 text-2xl font-bold">Produse</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/20">
              <th className="py-2">ID</th>
              <th>Titlu</th>
              <th>Categorie</th>
              <th>Preț</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-white/10">
                <td className="py-2">{item.id}</td>
                <td>{item.title}</td>
                <td>{item.category}</td>
                <td>{money(item.priceCents, item.currency || 'RON')}</td>
                <td className="space-x-2 py-2">
                  <Link href={`/admin/products/${item.id}`} className="rounded-lg border border-cyan-300/50 px-3 py-1 text-xs text-cyan-200">
                    Editează
                  </Link>
                  <AdminProductActions id={item.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
