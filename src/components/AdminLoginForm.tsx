'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminLoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') || '');

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setError('Parolă invalidă.');
      setLoading(false);
      return;
    }

    router.push('/admin/products');
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="glass mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-bold">Admin Ceva Bun</h1>
      <input
        type="password"
        name="password"
        required
        placeholder="Parolă"
        className="w-full rounded-xl bg-slate-900/50 p-3"
      />
      <button className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950" disabled={loading}>
        {loading ? 'Se verifică...' : 'Intră în admin'}
      </button>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </form>
  );
}
