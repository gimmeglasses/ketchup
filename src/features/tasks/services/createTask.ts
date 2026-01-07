import { db } from "@/app/db/client";
import { tasks } from "@/app/db/schema";
import { type Task } from "@/features/tasks/types";
import { type CreateTaskInput } from "../validations/createTaskSchema";

/**
 * 新しいタスクを作成します。
 *
 * @param userId ユーザーID
 * @param input タスク作成データ
 * @returns 作成されたタスク
 */
export async function createTask(
  userId: string,
  input: CreateTaskInput
): Promise<Task> {
  const [created] = await db
    .insert(tasks)
    .values({
      profileId: userId,
      title: input.title,
      estimatedMinutes: input.estimatedMinutes,
      dueAt: input.dueAt,
      note: input.note,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create task");
  }

  return created;
}
