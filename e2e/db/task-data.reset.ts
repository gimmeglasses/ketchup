import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "@/app/db/client";
import { reset } from "drizzle-seed";
import { tasks, pomodoroSessions } from "@/app/db/schema";

export const resetTaskData = async (userId?: string) => {
  // Safety check: Never run in production
  if (
    process.env.DATABASE_URL?.includes("supabase.com") ||
    process.env.NODE_ENV === "production"
  ) {
    console.warn("Skipping database reset: Production environment detected.");
    return;
  }
  if (userId) {
    await db
      .delete(pomodoroSessions)
      .where(eq(pomodoroSessions.profileId, userId));
    await db.delete(tasks).where(eq(tasks.profileId, userId));
    console.log(`Database reset: Data cleared for user ${userId}.`);
  } else {
    await reset(db, { tasks });
    console.log("Database reset: Tasks table cleared.");
  }
};
