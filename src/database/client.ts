// db.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

export function createDb(databaseUrl: string) {
  const sql = neon(databaseUrl);
  return drizzle(sql);
}
