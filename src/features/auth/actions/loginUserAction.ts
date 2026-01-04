"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { loginSchema } from "../validations/loginSchema";
import { loginUser } from "../services/loginUser";
import { toFieldErrors } from "@/lib/zodError";

/**
 * ログインフォームのフィールド名の型
 */
type LoginFields = keyof z.infer<typeof loginSchema>;

/**
 * ログインアクションのエラーレスポンスのフィールドエラー型
 */
type FieldErrors = Partial<Record<LoginFields, string[]>> & {
  _form?: string[];
};

/**
 * ログインアクションの結果型
 * @property {boolean} success - ログインが成功したかどうか
 * @property {FieldErrors} errors - バリデーションまたはサーバーエラーの詳細
 */
export type LoginActionResult = {
  success: false;
  errors: FieldErrors;
};

/**
 * ログインユーザーアクション (Server Action)
 *
 * フォームデータをバリデーションし、ユーザーのログインを処理します。
 * ログイン成功時はダッシュボードにリダイレクトします。
 *
 * @param {LoginActionResult} prevState - 前の状態 (useFormStateで使用)
 * @param {FormData} formData - ログインフォームのデータ (email, password)
 * @returns {Promise<LoginActionResult>} エラー情報を含む結果 (成功時はリダイレクト)
 * @throws リダイレクト時は例外が発生します
 */
export async function loginUserAction(
  prevState: LoginActionResult,
  formData: FormData
): Promise<LoginActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: toFieldErrors(parsed.error),
    };
  }

  try {
    await loginUser(parsed.data);
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : "ログインに失敗しました。時間をおいて再度お試しください。";

    return {
      success: false,
      errors: {
        _form: [message],
      },
    };
  }

  redirect("/dashboard");
}
