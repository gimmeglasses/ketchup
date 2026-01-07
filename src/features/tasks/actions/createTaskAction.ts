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

type FormValues = {
  title: string;
  estimatedMinutes?: string;
  dueAt?: string;
  note?: string;
};

export type CreateTaskActionResult =
  | {
      success: true;
      task: Task;
    }
  | {
      success: false;
      errors: FieldErrors;
      values?: FormValues;
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
  const values: FormValues = {
    title: formData.get("title") as string,
    estimatedMinutes: (formData.get("estimatedMinutes") as string) || undefined,
    dueAt: (formData.get("dueAt") as string) || undefined,
    note: (formData.get("note") as string) || undefined,
  };

  const parsed = createTaskSchema.safeParse(values);

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
          _form: ["タスクを作成するにはログインが必要です。"],
        },
        values,
      };
    }

    const task = await createTask(user.id, parsed.data);
    return { success: true, task };
  } catch (error) {
    console.error("Failed to create task:", error);
    return {
      success: false,
      errors: {
        _form: ["タスクの作成に失敗しました。時間をおいて再度お試しください。"],
      },
      values,
    };
  }
}
