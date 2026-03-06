import { createHash, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const ADMIN_COOKIE = 'ceva_admin';

const hash = (value: string) => createHash('sha256').update(value).digest();

export const validateAdminPassword = (value: string) => {
  const expected = process.env.ADMIN_PASSWORD || 'change-me';
  const candidateBuffer = hash(value);
  const expectedBuffer = hash(expected);
  return timingSafeEqual(candidateBuffer, expectedBuffer);
};

export const sessionToken = () => {
  const expected = process.env.ADMIN_PASSWORD || 'change-me';
  return createHash('sha256').update(`admin:${expected}`).digest('hex');
};

export const isAdmin = () => {
  const jar = cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  return token === sessionToken();
};

export const requireAdmin = () => {
  if (!isAdmin()) {
    redirect('/admin');
  }
};
