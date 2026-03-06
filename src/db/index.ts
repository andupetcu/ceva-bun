import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL?.replace(/^file:/, '') || './db/ceva-bun.db';

const sqlite = new Database(databaseUrl, { fileMustExist: false });
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
