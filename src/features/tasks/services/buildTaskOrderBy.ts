import { tasks } from "@/app/db/schema";
import { asc, desc } from "drizzle-orm";
import { type ListTasksParams } from "../types";

/**
 * タスク一覧の orderBy 句を生成する
 *
 * デフォルト:
 * - 未完了タスク優先
 * - 期限昇順
 * - 作成日時降順
 */
export function buildTaskOrderBy(params: ListTasksParams) {
  const sortBy = params.sortBy ?? "dueAt";
  const order = params.order ?? "asc";
  const direction = order === "asc" ? asc : desc;

  // 期限ソート（デフォルト）
  if (sortBy === "dueAt") {
    return [
      asc(tasks.completedAt), // NULL（未完了）優先
      direction(tasks.dueAt),
      desc(tasks.createdAt),
    ];
  }

  // 見積時間ソート
  if (sortBy === "estimatedMinutes") {
    return [
      asc(tasks.completedAt),
      direction(tasks.estimatedMinutes),
      desc(tasks.createdAt),
    ];
  }

  // 作成日時ソート
  return [direction(tasks.createdAt)];
}
