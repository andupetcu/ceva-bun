import fs from 'fs';
import path from 'path';
import { db } from './index';
import { products } from './schema';

type SeedProduct = Omit<typeof products.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;
type RawSeedProduct = SeedProduct & { lon?: number | null; lng?: number | null };

async function main() {
  const seedPath = path.resolve(process.cwd(), 'data/seed-products.json');
  const raw = fs.readFileSync(seedPath, 'utf-8');
  const entries = JSON.parse(raw) as RawSeedProduct[];
  const normalizedEntries: SeedProduct[] = entries.map((entry) => ({
    ...entry,
    lon: entry.lon ?? entry.lng ?? null,
  }));

  db.delete(products).run();

  if (normalizedEntries.length > 0) {
    // Batch insert to avoid SQLite variable limit
    const BATCH = 100;
    for (let i = 0; i < normalizedEntries.length; i += BATCH) {
      const batch = normalizedEntries.slice(i, i + BATCH);
      db.insert(products).values(batch).run();
    }
  }

  console.log(`Seed finalizat: ${normalizedEntries.length} produse inserate.`);
}

main().catch((error) => {
  console.error('Eroare la seed:', error);
  process.exit(1);
});
