import { db } from '@/db';
import { products } from '@/db/schema';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allProducts = db.select({ id: products.id, updatedAt: products.updatedAt }).from(products).all();

  const staticPages: MetadataRoute.Sitemap = [
    { url: 'https://ceva-bun.ro', lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://ceva-bun.ro/toate', lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: 'https://ceva-bun.ro/sugereaza', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://ceva-bun.ro/harta?c=de_facut', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    // Category pages
    { url: 'https://ceva-bun.ro/alege?c=bagat_in_gura', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://ceva-bun.ro/alege?c=de_facut', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://ceva-bun.ro/alege?c=de_purtat', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://ceva-bun.ro/alege?c=pentru_copii', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://ceva-bun.ro/alege?c=de_citit', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://ceva-bun.ro/alege?c=18plus', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  const productPages: MetadataRoute.Sitemap = allProducts.map((p) => ({
    url: `https://ceva-bun.ro/produs/${p.id}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}
