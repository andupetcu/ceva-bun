import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/auth';

export async function POST() {
  cookies().delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
