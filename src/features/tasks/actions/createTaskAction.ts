"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createTaskSchema } from "../validations/createTaskSchema";
import { createTask } from "../services/createTask";
import { toFieldErrors } from "@/lib/zodError";
import { type Task } from "../types";
import { z } from "zod";

type CreateTaskFields = keyof z.output<typeof createTaskSchema>;

type FieldErrors = Partial<Record<CreateTaskFields, string[]>> & {
  _form?: string[];
};

export type CreateTaskActionResult =
  | {
      success: true;
      task: Task;
    }
  | {
      success: false;
      errors: FieldErrors;
    };

/**
 * フォームから受け取ったタスク情報を検証し、新しいタスクを作成します。
 * 検証エラーはフィールド単位のエラーとして返し、実行時エラーはフォーム共通エラーとして返します。
 *
 * @param prevState サーバーアクションの前回の状態
 * @param formData フォーム送信された FormData
 * @returns 成功時は作成されたタスク、失敗時はエラーマップ
 */
export async function createTaskAction(
  prevState: CreateTaskActionResult,
  formData: FormData
): Promise<CreateTaskActionResult> {
  const raw = {
    title: formData.get("title"),
    estimatedMinutes: formData.get("estimatedMinutes"),
    dueAt: formData.get("dueAt"),
    note: formData.get("note"),
  };

  const parsed = createTaskSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: toFieldErrors(parsed.error) };
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
          _form: ["タスクを作成するにはログインが必要です。"],
        },
      };
    }

    const task = await createTask(user.id, parsed.data);
    return { success: true, task };
  } catch {
    return {
      success: false,
      errors: {
        _form: ["タスクの作成に失敗しました。時間をおいて再度お試しください。"],
      },
    };
  }
}
