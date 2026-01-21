"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteTask } from "@/features/tasks/services/deleteTask";
import { type Task } from "../types";

type FormValues = {
  taskId: string;
  title?: string;
};

export type DeleteTaskResult =
  | {
      success: true;
      task: Task;
    }
  | {
      success: false;
      errors?: {
        _form: string[];
      };
      values?: FormValues;
    };

/**
 * フォームから受け取ったタスク情報を検証し、そのタスクを削除します。
 * 検証エラーはフィールド単位のエラーとして返し、実行時エラーはフォーム共通エラーとして返します。
 *
 * @param prevState サーバーアクションの前回の状態
 * @param formData フォーム送信された FormData
 * @returns 成功時は削除されたタスク、失敗時はエラーマップ
 */
export async function deleteTaskAction(
  prevState: DeleteTaskResult,
  formData: FormData,
): Promise<DeleteTaskResult> {
  const values: FormValues = {
    taskId: formData.get("taskId") as string,
    title: formData.get("title") as string,
  };

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
        values,
      };
    }

    if (!values.taskId) {
      throw new Error("Task ID is required");
    }

    const task = await deleteTask(values.taskId);
    revalidatePath("/dashboard");
    return { success: true, task };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return {
      success: false,
      errors: {
        _form: ["タスクの削除に失敗しました。時間をおいて再度お試しください。"],
      },
      values,
    };
  }
}
