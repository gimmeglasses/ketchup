"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveSessionSchema } from "../validations/pomodoroSchemas";
import { getActiveSession } from "../services/getActiveSession";
import { toFieldErrors } from "@/lib/zodError";
import { type PomodoroSession } from "../types";
import { z } from "zod";

type GetActiveSessionFields = keyof z.output<typeof getActiveSessionSchema>;

type FieldErrors = Partial<Record<GetActiveSessionFields, string[]>> & {
  _form?: string[];
};

type FormValues = {
  taskId: string;
};

export type GetCurrentSessionActionResult =
  | {
      success: true;
      session: PomodoroSession | null;
    }
  | {
      success: false;
      errors: FieldErrors;
      values?: FormValues;
    };

/**
 * フォームから受け取ったタスクIDを検証し、現在のアクティブなポモドーロセッションを取得します。
 *
 * @param prevState サーバーアクションの前回の状態
 * @param formData フォーム送信された FormData
 * @returns 成功時はアクティブなセッション（存在しない場合はnull）、失敗時はエラーマップ
 */
export async function getCurrentSessionAction(
  prevState: GetCurrentSessionActionResult,
  formData: FormData
): Promise<GetCurrentSessionActionResult> {
  const values: FormValues = {
    taskId: formData.get("taskId") as string,
  };

  const parsed = getActiveSessionSchema.safeParse(values);

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
          _form: ["ポモドーロセッションを取得するにはログインが必要です。"],
        },
        values,
      };
    }

    const session = await getActiveSession(user.id, parsed.data.taskId);
    return { success: true, session };
  } catch (error) {
    console.error("Failed to get current pomodoro session:", error);
    return {
      success: false,
      errors: {
        _form: [
          "ポモドーロセッションの取得に失敗しました。時間をおいて再度お試しください。",
        ],
      },
      values,
    };
  }
}
