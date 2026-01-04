"use server";

import { type Task } from "@/features/tasks/types";
import { listTasks } from "@/features/tasks/services/listTasks";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * 認証されたユーザーのタスク一覧を取得します。
 *
 * @returns 作成日時の降順でソートされたタスクの配列
 * @throws 未認証の場合はエラー
 */
export async function listTasksAction(): Promise<Task[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("タスクの一覧を表示するにはユーザ認証が必要です。");
  }

  return listTasks(user.id);
}
