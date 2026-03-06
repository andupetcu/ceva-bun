'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ProductCategory } from '@/db/schema';
import { categoryEmoji, categoryLabels, categoryGradients } from '@/lib/utils';

export function CategoryCard({ category }: { category: ProductCategory }) {
  return (
    <motion.div whileHover={{ y: -6, scale: 1.02 }} transition={{ duration: 0.18 }}>
      <Link
        href={`/alege?c=${category}`}
        className={`glass block bg-gradient-to-br ${categoryGradients[category]} p-6`}
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
