import { db } from "@/app/db/client";
import { tasks } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { type Task } from "@/features/tasks/types";

/**
 * 既存タスクを削除します。
 *
 * @param taskId タスクID
 * @returns 削除されたタスク
 */
export async function deleteTask(taskId: string): Promise<Task> {
  const [deletedTask] = await db
    .delete(tasks)
    .where(eq(tasks.id, taskId))
    .returning();

  if (!deletedTask) {
    throw new Error("Failed to delete task");
  }

  return deletedTask;
}
