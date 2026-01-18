"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { completeTask } from "@/features/tasks/services/completeTask";
import { revalidatePath } from "next/cache";

export type CompleteTaskResult = {
  success: boolean;
  errors?: {
    _form?: string[];
  };
};

/**
 * フォームから受け取ったタスクID情報を検証し、そのタスクの完了処理を行います。
 * 検証エラーはフィールド単位のエラーとして返し、実行時エラーはフォーム共通エラーとして返します。
 *
 * @param taskId タスクID
 * @param prevState サーバーアクションの前回の状態
 * @returns 成功時は作成されたタスク、失敗時はエラーマップ
 */
export async function completeTaskAction(
  taskId: string
): Promise<CompleteTaskResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        errors: {
          _form: ["タスクを完了するにはログインが必要です。"],
        },
      };
    }
    const completedAt = new Date().toISOString();
    await completeTask(taskId, completedAt);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to complete task:", error);
    return {
      success: false,
      errors: {
        _form: ["タスクの完了に失敗しました。時間をおいて再度お試しください。"],
      },
    };
  }
}
