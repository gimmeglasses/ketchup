import { db } from "@/app/db/client";
import { tasks } from "@/app/db/schema";
import { eq } from "drizzle-orm";

/**
 * 既存タスクを削除します。
 * @param taskId タスクID
 */
export async function deleteTask(taskId: string): Promise<void> {
  const result = await db.delete(tasks).where(eq(tasks.id, taskId));

  if (result.count === 0) {
    throw new Error("Failed to delete task");
  }
}
