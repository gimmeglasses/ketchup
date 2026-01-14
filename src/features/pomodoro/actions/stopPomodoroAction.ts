"use server";

import { type z } from "zod";
import { toFieldErrors } from "@/lib/zodError";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { stopPomodoroSession } from "../services/stopPomodoroSession";
import { type PomodoroSession } from "../types";
import { stopPomodoroSchema } from "../validations/pomodoroSchemas";

type StopPomodoroFields = keyof z.output<typeof stopPomodoroSchema>;

type FieldErrors = Partial<Record<StopPomodoroFields, string[]>> & {
  _form?: string[];
};

type FormValues = {
  sessionId: string;
};

export type StopPomodoroActionResult =
  | { success: true; session: PomodoroSession }
  | { success: false; errors: FieldErrors; values?: FormValues };

/**
 * フォームから受け取ったセッションIDを検証し、ポモドーロセッションを停止します。
 *
 * @param prevState サーバーアクションの前回の状態
 * @param formData フォーム送信された FormData
 * @returns 成功時は停止されたセッション、失敗時はエラーマップ
 */
export async function stopPomodoroAction(
  prevState: StopPomodoroActionResult,
  formData: FormData
): Promise<StopPomodoroActionResult> {
  const values: FormValues = {
    sessionId: formData.get("sessionId") as string,
  };

  const parsed = stopPomodoroSchema.safeParse(values);
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
          _form: ["ポモドーロセッションを停止するにはログインが必要です。"],
        },
        values,
      };
    }

    const session = await stopPomodoroSession(parsed.data.sessionId, user.id);
    return { success: true, session };
  } catch (error) {
    console.error("Failed to stop pomodoro session:", error);
    return {
      success: false,
      errors: {
        _form: [
          "ポモドーロセッションの停止に失敗しました。時間をおいて再度お試しください。",
        ],
      },
      values,
    };
  }
}
