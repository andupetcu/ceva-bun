import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="space-y-5">
      <nav className="glass flex flex-wrap gap-3 p-4 text-sm">
        <Link href="/admin">Login</Link>
        <Link href="/admin/products">Produse</Link>
        <Link href="/admin/products/new">Adaugă produs</Link>
        <Link href="/admin/submissions">Sugestii</Link>
      </nav>
      {children}
    </main>
  );
}
