'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type ProductFormData = {
  id?: number;
  title?: string;
  description?: string | null;
  category?: 'baut' | 'mancat' | 'facut';
  priceCents?: number;
  oldPriceCents?: number | null;
  priceSuffix?: string | null;
  imageUrl?: string | null;
  productUrl?: string | null;
  affiliateUrl?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  sourceType?: 'affiliate' | 'map' | 'manual' | 'user' | null;
  available?: boolean | null;
  rating?: number | null;
  tags?: string[] | null;
  lat?: number | null;
  lng?: number | null;
};

export function AdminProductForm({ initial }: { initial?: ProductFormData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(initial?.id);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(event.currentTarget);
    const payload = {
      title: form.get('title'),
      description: form.get('description'),
      category: form.get('category'),
      priceCents: Number(form.get('priceCents')),
      oldPriceCents: Number(form.get('oldPriceCents') || 0) || null,
      priceSuffix: form.get('priceSuffix') || null,
      currency: 'RON',
      imageUrl: form.get('imageUrl') || null,
      productUrl: form.get('productUrl') || null,
      affiliateUrl: form.get('affiliateUrl') || null,
      sourceName: form.get('sourceName') || null,
      sourceUrl: form.get('sourceUrl') || null,
      sourceType: form.get('sourceType') || 'manual',
      available: form.get('available') === 'on',
      rating: Number(form.get('rating') || 0) || null,
      tags: String(form.get('tags') || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      lat: Number(form.get('lat') || 0) || null,
      lng: Number(form.get('lng') || 0) || null,
    };

    const response = await fetch(isEdit ? `/api/products/${initial?.id}` : '/api/products', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setError('Nu am putut salva produsul.');
      setLoading(false);
      return;
    }

    router.push('/admin/products');
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="glass space-y-4 p-6">
      <input name="title" required placeholder="Titlu" defaultValue={initial?.title || ''} className="w-full rounded-xl bg-slate-900/50 p-3" />
      <textarea name="description" placeholder="Descriere" defaultValue={initial?.description || ''} className="w-full rounded-xl bg-slate-900/50 p-3" rows={4} />
      <select name="category" defaultValue={initial?.category || 'baut'} className="w-full rounded-xl bg-slate-900/50 p-3">
        <option value="baut">Ceva Bun de Băut</option>
        <option value="mancat">Ceva Bun de Mâncat</option>
        <option value="facut">Ceva Bun de Făcut</option>
      </select>
      <input name="priceCents" type="number" required defaultValue={initial?.priceCents || 0} placeholder="Preț (bani)" className="w-full rounded-xl bg-slate-900/50 p-3" />
      <input name="oldPriceCents" type="number" defaultValue={initial?.oldPriceCents || ''} placeholder="Preț vechi (bani)" className="w-full rounded-xl bg-slate-900/50 p-3" />
      <input name="priceSuffix" defaultValue={initial?.priceSuffix || ''} placeholder="Sufix preț (ex: lei/persoană)" className="w-full rounded-xl bg-slate-900/50 p-3" />
      <input name="imageUrl" defaultValue={initial?.imageUrl || ''} placeholder="URL imagine" className="w-full rounded-xl bg-slate-900/50 p-3" />
      <input name="productUrl" defaultValue={initial?.productUrl || ''} placeholder="URL produs" className="w-full rounded-xl bg-slate-900/50 p-3" />
      <input name="affiliateUrl" defaultValue={initial?.affiliateUrl || ''} placeholder="URL afiliat" className="w-full rounded-xl bg-slate-900/50 p-3" />
      <input name="sourceName" defaultValue={initial?.sourceName || ''} placeholder="Nume sursă" className="w-full rounded-xl bg-slate-900/50 p-3" />
      <input name="sourceUrl" defaultValue={initial?.sourceUrl || ''} placeholder="URL sursă" className="w-full rounded-xl bg-slate-900/50 p-3" />
      <select name="sourceType" defaultValue={initial?.sourceType || 'manual'} className="w-full rounded-xl bg-slate-900/50 p-3">
        <option value="affiliate">affiliate</option>
        <option value="map">map</option>
        <option value="manual">manual</option>
        <option value="user">user</option>
      </select>
      <input name="rating" type="number" min="0" max="5" step="0.1" defaultValue={initial?.rating || ''} placeholder="Rating" className="w-full rounded-xl bg-slate-900/50 p-3" />
      <input name="tags" defaultValue={initial?.tags?.join(', ') || ''} placeholder="Taguri separate prin virgulă" className="w-full rounded-xl bg-slate-900/50 p-3" />
      <div className="grid gap-3 md:grid-cols-2">
        <input name="lat" type="number" step="any" defaultValue={initial?.lat || ''} placeholder="Latitudine" className="w-full rounded-xl bg-slate-900/50 p-3" />
        <input name="lng" type="number" step="any" defaultValue={initial?.lng || ''} placeholder="Longitudine" className="w-full rounded-xl bg-slate-900/50 p-3" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input name="available" type="checkbox" defaultChecked={initial?.available ?? true} />
        Disponibil
      </label>
      <button disabled={loading} className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950">
        {loading ? 'Se salvează...' : isEdit ? 'Salvează modificările' : 'Creează produsul'}
      </button>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </form>
  );
}
