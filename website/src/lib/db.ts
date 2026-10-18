import "server-only";
import { Pool } from "pg";

const databaseGlobal = globalThis as typeof globalThis & { autheraPool?: Pool };

export function getDatabase(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Set DATABASE_URL in .env.local before using the database.");
  }
  if (!databaseGlobal.autheraPool) {
    databaseGlobal.autheraPool = new Pool({ connectionString });
  }
  return databaseGlobal.autheraPool;
}
