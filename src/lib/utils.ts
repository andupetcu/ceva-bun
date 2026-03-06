import type { ProductCategory } from '@/db/schema';

export const categoryLabels: Record<ProductCategory, string> = {
  bagat_in_gura: 'De Băgat în Gură',
  de_facut: 'De F***t',
  de_purtat: 'De Purtat',
  pentru_copii: 'Pentru Copii',
  de_citit: 'De Citit',
  '18plus': '18+',
};

export const categoryEmoji: Record<ProductCategory, string> = {
  bagat_in_gura: '🍴',
  de_facut: '🔥',
  de_purtat: '👕',
  pentru_copii: '👶',
  de_citit: '📚',
  '18plus': '🔞',
};

export const categoryGradients: Record<ProductCategory, string> = {
  bagat_in_gura: 'from-pink-500/20 to-fuchsia-500/20',
  de_facut: 'from-amber-500/20 to-orange-500/20',
  de_purtat: 'from-sky-500/20 to-cyan-500/20',
  pentru_copii: 'from-green-500/20 to-emerald-500/20',
  de_citit: 'from-purple-500/20 to-violet-500/20',
  '18plus': 'from-red-500/20 to-rose-500/20',
};

export const money = (priceCents: number, currency = 'RON') =>
  new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(priceCents / 100);

export const parseCategory = (input: string | null): ProductCategory | null => {
  if (!input) return null;
  const valid: string[] = ['bagat_in_gura', 'de_facut', 'de_purtat', 'pentru_copii', 'de_citit', '18plus'];
  if (valid.includes(input)) return input as ProductCategory;
  return null;
};

export const cn = (...classes: Array<string | undefined | null | false>) =>
  classes.filter(Boolean).join(' ');
