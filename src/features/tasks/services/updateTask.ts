import { db } from "@/app/db/client";
import { tasks } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { type Task } from "@/features/tasks/types";
import { type UpdateTaskInput } from "../validations/updateTaskSchema";

/**
 * 既存タスクを更新します。
 *
 * @param taskId タスクID
 * @param input タスク更新データ
 * @returns 更新されたタスク
 */
export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const [updatedTask] = await db
    .update(tasks)
    .set({
      title: input.title,
      estimatedMinutes: input.estimatedMinutes,
      dueAt: input.dueAt,
      note: input.note,
    })
    .where(eq(tasks.id, taskId))
    .returning();

  if (!updatedTask) {
    throw new Error("Failed to update task");
  }

  return updatedTask;
}
