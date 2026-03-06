import { NextResponse } from 'next/server';
import { db } from '@/db';
import { submissions } from '@/db/schema';
import { parseCategory } from '@/lib/utils';

export async function POST(request: Request) {
  const body = await request.json();
  const category = parseCategory(body.category);

  if (!body.title || !category) {
    return NextResponse.json({ error: 'Date invalide' }, { status: 400 });
  }

  db.insert(submissions)
    .values({
      title: body.title,
      description: body.description || null,
      category,
      suggestedPrice: body.suggestedPrice || null,
      url: body.url || null,
      submitterName: body.submitterName || 'Anonim',
      status: 'pending',
    })
    .run();

  return NextResponse.json({ ok: true }, { status: 201 });
}
