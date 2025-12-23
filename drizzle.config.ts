import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "Environment variable DATABASE_URL is not set. " +
      "Please configure DATABASE_URL in your environment before running drizzle."
  );
}

export default defineConfig({
  schema: "./src/app/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
