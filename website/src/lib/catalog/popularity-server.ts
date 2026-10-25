import "server-only";
import { Pool } from "pg";

const state = globalThis as typeof globalThis & { popularityPool?: Pool };
export function popularityDatabase() {
  if (!process.env.DATABASE_URL) throw new Error("Popularity database unavailable");
  return state.popularityPool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 2, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000, statement_timeout: 5000 });
}
