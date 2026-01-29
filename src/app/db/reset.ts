import "dotenv/config";
import { db } from "./client";
import { reset } from "drizzle-seed";
import { tasks } from "./schema";

export const resetDataBase = async () => {
  // Safety check: Never run in production
  if (
    process.env.DATABASE_URL?.includes("supabase.com") ||
    process.env.NODE_ENV === "production"
  ) {
    console.warn("Skipping database reset: Production environment detected.");
    return;
  }
  await reset(db, { tasks });
  console.log("Database reset: Tasks table cleared.");
};
