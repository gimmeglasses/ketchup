"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toFieldErrors } from "@/lib/zodError";
import { updateTaskSchema } from "../validations/tasks/updateTaskSchema";
import { updateTask } from "../services/updateTask";
import { type Task } from "../types";
import { z } from "zod";

type UpdateTaskFields = keyof z.output<typeof updateTaskSchema>;

type FieldErrors = Partial<Record<UpdateTaskFields, string[]>> & {
  _form?: string[];
};

type FormValues = {
  id: string;
  title: string;
  estimatedMinutes: string;
  dueAt: string;
  note: string;
};

export type UpdatedTaskActionResult =
  | {
      success: true;
      task?: Task;
    }
  | {
      success: false;
      errors: FieldErrors;
      values?: FormValues;
    };

/**
 * フォームから受け取ったタスク情報を検証し、既存タスクを更新します。
 * 検証エラーはフィールド単位のエラーとして返し、実行時エラーはフォーム共通エラーとして返します。
 *
 * @param prevState サーバーアクションの前回の状態
 * @param formData フォーム送信された FormData
 * @returns 成功時は更新されたタスク、失敗時はエラーマップ
 */
export async function updateTaskAction(
  prevState: UpdatedTaskActionResult,
  formData: FormData,
): Promise<UpdatedTaskActionResult> {
  const values: FormValues = {
    id: formData.get("id") as string,
    title: formData.get("title") as string,
    estimatedMinutes: formData.get("estimatedMinutes") as string,
    dueAt: formData.get("dueAt") as string,
    note: formData.get("note") as string,
  };

  const parsed = updateTaskSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, errors: toFieldErrors(parsed.error), values };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        errors: {
          _form: ["タスクを更新するにはログインが必要です。"],
        },
        values,
      };
    }

    const task = await updateTask(parsed.data);
    revalidatePath("/dashboard");
    return { success: true, task };
  } catch (error) {
    console.error("Failed to update task:", error);
    return {
      success: false,
      errors: {
        _form: ["タスクの更新に失敗しました。時間をおいて再度お試しください。"],
      },
      values,
    };
  }
}
