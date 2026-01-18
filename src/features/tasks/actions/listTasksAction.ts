"use server";

import { listTasks } from "@/features/tasks/services/listTasks";
import { type Task, type ListTasksParams } from "@/features/tasks/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function listTasksAction(
  filter?: ListTasksParams
): Promise<Task[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("タスクの一覧を表示するにはユーザー認証が必要です。");
  }

  return listTasks({
    userId: user.id,
    filter,
  });
}