"use server";

import { redirect } from "next/navigation";
import { registerSchema } from "../validations/registerSchema";
import { registerUser } from "../services/registerUser";
import { z } from "zod";
import { toFieldErrors } from "@/lib/zodError";

type RegisterFields = keyof z.infer<typeof registerSchema>;

type FieldErrors = Partial<Record<RegisterFields, string[]>> & {
  _form?: string[];
};

export type RegisterActionResult = {
  success: false;
  errors: FieldErrors;
};

/**
 * フォームから受け取った登録情報を検証し、Supabase 経由でユーザー作成を実行します。
 * 検証エラーはフィールド単位のエラーとして返し、実行時エラーはフォーム共通エラーとして返します。
 * 成功時は登録完了ページにリダイレクトします。
 * @param prevState サーバーアクションの前回の状態
 * @param formData フォーム送信された FormData
 * @returns エラーマップ（エラー時のみ値を返し、成功時は登録完了ページへリダイレクトして値は返しません）
 */
export async function registerUserAction(
  prevState: RegisterActionResult,
  formData: FormData
): Promise<RegisterActionResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: toFieldErrors(parsed.error) };
  }

  try {
    await registerUser(parsed.data);
  } catch (e: unknown) {
    const message =
      e instanceof Error
        ? e.message
        : "登録に失敗しました。時間をおいて再度お試しください。";

    return {
      success: false,
      errors: {
        _form: [message],
      },
    };
  }
  redirect("/auth/register/success");
}
