import type { ProductCategory } from '@/db/schema';

export const categoryLabels: Record<ProductCategory, string> = {
  baut: 'Ceva Bun de Băut',
  mancat: 'Ceva Bun de Mâncat',
  facut: 'Ceva Bun de Făcut',
};

export const categoryEmoji: Record<ProductCategory, string> = {
  baut: '🍷',
  mancat: '🍕',
  facut: '🎯',
};

export const money = (priceCents: number, currency = 'RON') =>
  new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(priceCents / 100);

export const parseCategory = (input: string | null): ProductCategory | null => {
  if (!input) return null;
  if (input === 'baut' || input === 'mancat' || input === 'facut') return input;
  return null;
};

export const cn = (...classes: Array<string | undefined | null | false>) =>
  classes.filter(Boolean).join(' ');
