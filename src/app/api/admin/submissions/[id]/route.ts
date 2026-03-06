import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { submissions } from '@/db/schema';
import { isAdmin } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 });
  }

  const body = await request.json();
  const status = body.status;

  if (status !== 'approved' && status !== 'rejected') {
    return NextResponse.json({ error: 'Status invalid' }, { status: 400 });
  }

  db.update(submissions)
    .set({ status, adminNotes: body.adminNotes || null })
    .where(eq(submissions.id, Number(params.id)))
    .run();

  return NextResponse.json({ ok: true });
}
