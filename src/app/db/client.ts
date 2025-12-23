import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let connectionString = process.env.DATABASE_URL!;

if (connectionString.includes("postgres:postgres@supabase_db_")) {
  const url = new URL(connectionString);
  url.hostname = url.hostname.split("_")[1]!;
  connectionString = url.toString();
}

export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);
