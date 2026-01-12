"use server";

import { type z } from "zod";
import { toFieldErrors } from "@/lib/zodError";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPomodoroSession } from "../services/createPomodoroSession";
import { type PomodoroSession } from "../types";
import { startPomodoroSchema } from "../validations/pomodoroSchemas";

type StartPomodoroFields = keyof z.output<typeof startPomodoroSchema>;

type FieldErrors = Partial<Record<StartPomodoroFields, string[]>> & {
  _form?: string[];
};

type FormValues = {
  taskId: string;
};

export type StartPomodoroActionResult =
  | { success: true; session: PomodoroSession }
  | { success: false; errors: FieldErrors; values?: FormValues };

/**
 * フォームから受け取ったタスクIDを検証し、新しいポモドーロセッションを開始します。
 * 既にアクティブなセッションが存在する場合はエラーを返します。
 *
 * @param prevState サーバーアクションの前回の状態
 * @param formData フォーム送信された FormData
 * @returns 成功時は作成されたセッション、失敗時はエラーマップ
 */
export async function startPomodoroAction(
  prevState: StartPomodoroActionResult,
  formData: FormData
): Promise<StartPomodoroActionResult> {
  const values: FormValues = {
    taskId: formData.get("taskId") as string,
  };

  const parsed = startPomodoroSchema.safeParse(values);
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
          _form: ["ポモドーロセッションを開始するにはログインが必要です。"],
        },
        values,
      };
    }

    const session = await createPomodoroSession(user.id, parsed.data.taskId);
    return { success: true, session };
  } catch (error) {
    console.error("Failed to start pomodoro session:", error);
    return {
      success: false,
      errors: {
        _form: [
          "ポモドーロセッションの開始に失敗しました。時間をおいて再度お試しください。",
        ],
      },
      values,
    };
  }
}
