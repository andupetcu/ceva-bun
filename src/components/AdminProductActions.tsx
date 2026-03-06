'use client';

import { useRouter } from 'next/navigation';

export function AdminProductActions({ id }: { id: number }) {
  const router = useRouter();

  const onDelete = async () => {
    if (!window.confirm('Sigur vrei să ștergi acest produs?')) return;
    const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (response.ok) {
      router.refresh();
    }
  };

  return (
    <button onClick={onDelete} className="rounded-lg border border-rose-400/50 px-3 py-1 text-xs text-rose-300">
      Șterge
    </button>
  );
}
