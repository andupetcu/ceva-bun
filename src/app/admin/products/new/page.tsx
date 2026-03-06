import { AdminProductForm } from '@/components/AdminProductForm';
import { requireAdmin } from '@/lib/auth';

export default function AdminNewProductPage() {
  requireAdmin();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Produs nou</h1>
      <AdminProductForm />
    </section>
  );
}
