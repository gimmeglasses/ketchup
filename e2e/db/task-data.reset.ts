import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "@/app/db/client";
import { reset } from "drizzle-seed";
import { tasks, pomodoroSessions } from "@/app/db/schema";

export const resetTaskData = async (userId?: string) => {
  // Safety check: DBリセットは明示的に許可された環境でのみ実行する
  if (process.env.ALLOW_DB_RESET !== "true") {
    console.warn(
      "Avoid resetting task table ALLOW_DB_RESET is not set to 'true'.",
    );
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
