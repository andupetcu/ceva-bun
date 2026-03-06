export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { AdminLoginForm } from '@/components/AdminLoginForm';
import { isAdmin } from '@/lib/auth';

export default function AdminLoginPage() {
  if (isAdmin()) {
    redirect('/admin/products');
  }

  return <AdminLoginForm />;
}
