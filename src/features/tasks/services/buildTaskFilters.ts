import { tasks } from "@/app/db/schema";
import { and, isNotNull, isNull, lt, gte } from "drizzle-orm";
import { type ListTasksParams } from "../types";

/**
 * タスク一覧取得用の where 句を生成する
 */
export function buildTaskFilters(params: ListTasksParams) {
  const conditions = [];

  // ステータスフィルタ
  if (params.status === "todo") {
    conditions.push(isNull(tasks.completedAt));
  }

  if (params.status === "done") {
    conditions.push(isNotNull(tasks.completedAt));
  }

  // 期限フィルタ
  const now = new Date();

  if (params.due === "withDue") {
    conditions.push(isNotNull(tasks.dueAt));
  }

  if (params.due === "withoutDue") {
    conditions.push(isNull(tasks.dueAt));
  }

  if (params.due === "today") {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    conditions.push(
      isNotNull(tasks.dueAt),
      gte(tasks.dueAt, startOfToday.toISOString()),
    );
  }

  if (params.due === "overdue") {
    conditions.push(
      isNull(tasks.completedAt),
      isNotNull(tasks.dueAt),
      lt(tasks.dueAt, now.toISOString()),
    );
  }

  return conditions.length ? and(...conditions) : undefined;
}
