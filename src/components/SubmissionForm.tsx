'use client';

import { FormEvent, useState } from 'react';

export function SubmissionForm() {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get('title'),
      description: form.get('description'),
      category: form.get('category'),
      suggestedPrice: Number(form.get('suggestedPrice') || 0),
      url: form.get('url'),
      submitterName: form.get('submitterName'),
    };

    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      event.currentTarget.reset();
      setMessage('Mulțumim! Sugestia ta a fost trimisă pentru aprobare.');
    } else {
      setMessage('A apărut o eroare. Încearcă din nou.');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={onSubmit} className="glass space-y-4 p-6">
      <input name="title" required placeholder="Titlu" className="w-full rounded-xl bg-slate-900/50 p-3" />
      <textarea name="description" placeholder="Descriere" className="w-full rounded-xl bg-slate-900/50 p-3" rows={4} />
      <select name="category" required className="w-full rounded-xl bg-slate-900/50 p-3">
        <option value="baut">Ceva Bun de Băut</option>
        <option value="mancat">Ceva Bun de Mâncat</option>
        <option value="facut">Ceva Bun de Făcut</option>
      </select>
      <input name="suggestedPrice" type="number" min={0} placeholder="Preț estimat (bani)" className="w-full rounded-xl bg-slate-900/50 p-3" />
      <input name="url" placeholder="URL" className="w-full rounded-xl bg-slate-900/50 p-3" />
      <input name="submitterName" placeholder="Numele tău" className="w-full rounded-xl bg-slate-900/50 p-3" />
      <button disabled={loading} className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950">
        {loading ? 'Se trimite...' : 'Trimite sugestia'}
      </button>
      {message ? <p className="text-sm text-cyan-200">{message}</p> : null}
    </form>
  );
}
