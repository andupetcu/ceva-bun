import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const categories = ['bagat_in_gura', 'de_facut', 'de_purtat', 'pentru_copii', 'de_citit', '18plus'] as const;
export type ProductCategory = (typeof categories)[number];

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category', { enum: categories }).notNull(),
  priceCents: integer('price_cents').notNull(),
  oldPriceCents: integer('old_price_cents'),
  priceSuffix: text('price_suffix'),
  currency: text('currency').default('RON'),
  imageUrl: text('image_url'),
  productUrl: text('product_url'),
  affiliateUrl: text('affiliate_url'),
  sourceName: text('source_name'),
  sourceUrl: text('source_url'),
  sourceType: text('source_type', {
    enum: ['affiliate', 'map', 'manual', 'user'],
  }).default('manual'),
  available: integer('available', { mode: 'boolean' }).default(true),
  rating: real('rating'),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  lat: real('lat'),
  lng: real('lng'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const submissions = sqliteTable('submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category', { enum: categories }).notNull(),
  suggestedPrice: integer('suggested_price'),
  url: text('url'),
  submitterName: text('submitter_name'),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending'),
  adminNotes: text('admin_notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
