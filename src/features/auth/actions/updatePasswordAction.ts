"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { updatePasswordSchema } from "../validations/updatePasswordSchema";
import { updatePassword } from "../services/updatePassword";
import { toFieldErrors } from "@/lib/zodError";

/**
 * パスワード更新フォームのフィールド名の型
 */
type UpdatePasswordFields = keyof z.infer<typeof updatePasswordSchema>;

/**
 * パスワード更新アクションのエラーレスポンスのフィールドエラー型
 */
type FieldErrors = Partial<Record<UpdatePasswordFields, string[]>> & {
  _form?: string[];
};

/**
 * パスワード更新アクションの結果型
 * @property {boolean} success - パスワード更新が成功したかどうか
 * @property {FieldErrors} errors - バリデーションまたはサーバーエラーの詳細
 */
export type UpdatePasswordActionResult = {
  success: false;
  errors: FieldErrors;
};

/**
 * パスワード更新アクション (Server Action)
 *
 * フォームデータをバリデーションし、ユーザーのパスワードを更新します。
 * パスワード更新成功時はログイン画面にリダイレクトします。
 *
 * @param {UpdatePasswordActionResult} prevState - 前の状態 (useActionStateで使用)
 * @param {FormData} formData - パスワード更新フォームのデータ (password, passwordConfirmation)
 * @returns {Promise<UpdatePasswordActionResult>} エラー情報を含む結果 (成功時はリダイレクト)
 * @throws リダイレクト時は例外が発生します
 */
export async function updatePasswordAction(
  prevState: UpdatePasswordActionResult,
  formData: FormData
): Promise<UpdatePasswordActionResult> {
  const raw = {
    password: formData.get("password"),
    passwordConfirmation: formData.get("passwordConfirmation"),
  };

  const parsed = updatePasswordSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: toFieldErrors(parsed.error),
    };
  }

  try {
    await updatePassword(parsed.data);
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : "パスワードの更新に失敗しました。時間をおいて再度お試しください。";

    return {
      success: false,
      errors: {
        _form: [message],
      },
    };
  }

  redirect("/auth/login");
}
