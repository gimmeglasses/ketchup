import { db } from "@/app/db/client";
import { tasks } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { type Task } from "@/features/tasks/types";

export async function completeTask(
  taskId: string,
  completedAt: string
): Promise<Task> {
  const [completed] = await db
    .update(tasks)
    .set({ completedAt: completedAt })
    .where(eq(tasks.id, taskId))
    .returning();

  if (!completed) {
    throw new Error("Failed to complete task");
  }
  console.log(completed);
  return completed;
}
