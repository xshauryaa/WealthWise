import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { env } from './env';
import * as schema from '../db/schema';

// Create Neon HTTP client
const sql = neon(env.DATABASE_URL);

// Initialize Drizzle ORM with Neon
export const db = drizzle(sql, { schema });

// Type export for use across the application
export type Database = typeof db;
