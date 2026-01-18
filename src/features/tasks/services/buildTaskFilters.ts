import { tasks } from "@/app/db/schema";
import { and, isNotNull, isNull, lt, lte } from "drizzle-orm";
import { type ListTasksParams } from "../types";

/**
 * タスク一覧取得用の where 句を生成する
 * @param params - フィルタリング条件を含むパラメータオブジェクト
 * @returns Drizzle ORM の where 句、または条件がない場合は undefined
 */
export function buildTaskFilters(params: ListTasksParams) {
  // フィルタリング条件を格納する配列
  const conditions = [];

  // ===== ステータスフィルタ =====
  // todo: 未完了のタスクを取得（completedAt が NULL）
  if (params.status === "todo") {
    conditions.push(isNull(tasks.completedAt));
  }

  // done: 完了済みのタスクを取得（completedAt が NOT NULL）
  if (params.status === "done") {
    conditions.push(isNotNull(tasks.completedAt));
  }

  // ===== 期限フィルタ =====
  // 現在時刻を基準に期限条件を判定
  const now = new Date();

  // withDue: 期限が設定されているタスクを取得
  if (params.due === "withDue") {
    conditions.push(isNotNull(tasks.dueAt));
  }

  // withoutDue: 期限が設定されていないタスクを取得
  if (params.due === "withoutDue") {
    conditions.push(isNull(tasks.dueAt));
  }

  // today: 今日までに期限が切れた未完了タスクを取得
  // 本日の23:59:59までを「今日」の範囲とする
  if (params.due === "today") {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    conditions.push(
      isNull(tasks.completedAt), // 未完了
      isNotNull(tasks.dueAt), // 期限が設定されている
      lte(tasks.dueAt, endOfToday.toISOString()), // 期限が今日以前
    );
  }

  // overdue: 期限切れ（現在時刻より前の期限を持つ未完了タスク）
  if (params.due === "overdue") {
    conditions.push(
      isNull(tasks.completedAt), // 未完了
      isNotNull(tasks.dueAt), // 期限が設定されている
      lt(tasks.dueAt, now.toISOString()), // 期限が現在時刻より前
    );
  }

  // すべての条件を AND で結合、条件がない場合は undefined を返す
  return conditions.length ? and(...conditions) : undefined;
}
