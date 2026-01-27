"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteTask } from "@/features/tasks/services/deleteTask";

export type DeleteTaskResult = {
  success: boolean;
  errors?: {
    _form?: string[];
  };
};
/**
 * フォームから受け取ったタスク情報を検証し、そのタスクを削除します。
 * 検証エラーはフィールド単位のエラーとして返し、実行時エラーはフォーム共通エラーとして返します。
 *
 * @param taskId タスクID
 * @returns 成功時は削除されたタスク、失敗時はエラーマップ
 */
export async function deleteTaskAction(
  taskId: string,
): Promise<DeleteTaskResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        errors: {
          _form: ["タスクを削除するにはログインが必要です。"],
        },
      };
    }
    if (!taskId) {
      throw new Error("Task ID is required");
    }
    await deleteTask(taskId);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return {
      success: false,
      errors: {
        _form: ["タスクの削除に失敗しました。時間をおいて再度お試しください。"],
      },
    };
  }
}
