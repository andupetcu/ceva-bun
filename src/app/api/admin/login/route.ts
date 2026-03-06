import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, sessionToken, validateAdminPassword } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const password = String(body.password || '');

  if (!validateAdminPassword(password)) {
    return NextResponse.json({ error: 'Parolă invalidă' }, { status: 401 });
  }

  cookies().set({
    name: ADMIN_COOKIE,
    value: sessionToken(),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 10,
  });

  return NextResponse.json({ ok: true });
}
