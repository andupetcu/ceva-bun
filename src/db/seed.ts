import fs from 'fs';
import path from 'path';
import { db } from './index';
import { products } from './schema';

type SeedProduct = Omit<typeof products.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;

async function main() {
  const seedPath = path.resolve(process.cwd(), 'data/seed-products.json');
  const raw = fs.readFileSync(seedPath, 'utf-8');
  const entries = JSON.parse(raw) as SeedProduct[];

  db.delete(products).run();

  if (entries.length > 0) {
    // Batch insert to avoid SQLite variable limit
    const BATCH = 100;
    for (let i = 0; i < entries.length; i += BATCH) {
      const batch = entries.slice(i, i + BATCH);
      db.insert(products).values(batch).run();
    }
  }

  console.log(`Seed finalizat: ${entries.length} produse inserate.`);
}

main().catch((error) => {
  console.error('Eroare la seed:', error);
  process.exit(1);
});
