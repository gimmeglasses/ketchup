import { db } from "@/app/db/client";
import { tasks } from "@/app/db/schema";
import { eq, and, sql, isNull } from "drizzle-orm";

export async function completeTask(taskId: string): Promise<Void> {
  const result = await db
    .update(tasks)
    .set({ completedAt: sql`now()` })
    .where(and(eq(tasks.id, taskId), isNull(tasks.completedAt)));

  if (result.count === 0) {
    throw new Error("Task not found or already completed");
  }
}
