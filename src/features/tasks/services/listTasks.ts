import { db } from "@/app/db/client";
import { tasks } from "@/app/db/schema";
import { type Task, type ListTasksParams } from "@/features/tasks/types";
import { eq, and } from "drizzle-orm";
import { buildTaskFilters } from "./buildTaskFilters";
import { buildTaskOrderBy } from "./buildTaskOrderBy";

export type ListTasksServiceParams = {
  userId: string;
  filter?: ListTasksParams;
};

/**
 * 指定ユーザーのタスク一覧を取得します。
 *
 * @param userId ユーザーID
 * @returns 作成日時の降順でソートされたタスクの配列
 */
export async function listTasks({
  userId,
  filter = {},
}: ListTasksServiceParams): Promise<Task[]> {
  const filters = buildTaskFilters(filter);

  // profileId条件とフィルター条件を結合
  const whereCondition = filters
    ? and(eq(tasks.profileId, userId), filters)
    : eq(tasks.profileId, userId);

  return db
    .select()
    .from(tasks)
    .where(whereCondition)
    .orderBy(...buildTaskOrderBy(filter));
}
