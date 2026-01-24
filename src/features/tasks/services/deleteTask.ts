import { db } from "@/app/db/client";
import { tasks } from "@/app/db/schema";
import { eq } from "drizzle-orm";

/**
 * 既存タスクを削除します。
 * @param taskId タスクID
 */
export async function deleteTask(taskId: string): Promise<void> {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  console.log(task);
  if (!task) {
    throw new Error("Task not found");
  }

  await db.delete(tasks).where(eq(tasks.id, taskId));
}
