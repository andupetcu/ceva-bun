export const dynamic = 'force-dynamic';

import { desc, eq } from 'drizzle-orm';
import { AdminSubmissionActions } from '@/components/AdminSubmissionActions';
import { db } from '@/db';
import { submissions } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';

export default async function AdminSubmissionsPage() {
  requireAdmin();

  const rows = await db
    .select()
    .from(submissions)
    .where(eq(submissions.status, 'pending'))
    .orderBy(desc(submissions.id));

  return (
    <section className="glass p-6">
      <h1 className="mb-4 text-2xl font-bold">Sugestii în așteptare</h1>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded-2xl border border-white/20 p-4">
            <h2 className="text-lg font-semibold">{row.title}</h2>
            <p className="text-sm text-slate-300">Categorie: {row.category}</p>
            {row.description ? <p className="mt-2 text-sm text-slate-200">{row.description}</p> : null}
            <div className="mt-3">
              <AdminSubmissionActions id={row.id} />
            </div>
          </article>
        ))}
        {rows.length === 0 ? <p className="text-sm text-slate-300">Nu există sugestii în așteptare.</p> : null}
      </div>
    </section>
  );
}
