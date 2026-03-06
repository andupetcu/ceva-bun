'use client';

import { useRouter } from 'next/navigation';

export function AdminSubmissionActions({ id }: { id: number }) {
  const router = useRouter();

  const patchStatus = async (status: 'approved' | 'rejected') => {
    const response = await fetch(`/api/admin/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      router.refresh();
    }
  };

  return (
    <div className="flex gap-2">
      <button onClick={() => patchStatus('approved')} className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950">
        Aprobă
      </button>
      <button onClick={() => patchStatus('rejected')} className="rounded-lg border border-rose-400/50 px-3 py-1 text-xs text-rose-300">
        Respinge
      </button>
    </div>
  );
}
