'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ProductCategory } from '@/db/schema';
import { categoryEmoji, categoryLabels } from '@/lib/utils';

const gradients: Record<ProductCategory, string> = {
  baut: 'from-cyan-500/20 to-blue-500/20',
  mancat: 'from-amber-500/20 to-orange-500/20',
  facut: 'from-emerald-500/20 to-teal-500/20',
};

export function CategoryCard({ category }: { category: ProductCategory }) {
  return (
    <motion.div whileHover={{ y: -6, scale: 1.02 }} transition={{ duration: 0.18 }}>
      <Link
        href={`/alege?c=${category}`}
        className={`glass block bg-gradient-to-br ${gradients[category]} p-6`}
      >
        <div className="mb-4 text-3xl">{categoryEmoji[category]}</div>
        <h3 className="text-xl font-bold">{categoryLabels[category]}</h3>
        <p className="mt-2 text-sm text-slate-200/90 light:text-slate-700">
          Alege un buget și îți sugerăm ceva bun.
        </p>
      </Link>
    </motion.div>
  );
}
