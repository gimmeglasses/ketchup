import { db } from "@/app/db/client";
import { tasks } from "@/app/db/schema";
import { type Task } from "@/features/tasks/types";
import { desc, eq } from "drizzle-orm";

/**
 * 指定ユーザーのタスク一覧を取得します。
 *
 * @param userId ユーザーID
 * @returns 作成日時の降順でソートされたタスクの配列
 */
export async function listTasks(userId: string): Promise<Task[]> {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.createdAt));
}
