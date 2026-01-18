"use server";

import { getAllTasksPomodoroMinutes } from "@/features/pomodoro/services/getAllTasksPomodoroMinutes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * 認証されたユーザーの全タスクの完了したポモドーロセッション実績時間を取得します。
 *
 * @returns タスクIDをキー、実績時間（分）を値とするRecord
 * @throws 未認証の場合はエラー
 */
export async function getAllTasksPomodoroMinutesAction(): Promise<
  Record<string, number>
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "ポモドーロ実績を取得するにはユーザー認証が必要です。"
    );
  }

  return getAllTasksPomodoroMinutes(user.id);
}
