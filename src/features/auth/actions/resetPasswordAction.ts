"use server";

import { z } from "zod";

import { resetPasswordSchema } from "../validations/resetPasswordSchema";
import { resetPassword } from "../services/resetPassword";
import { toFieldErrors } from "@/lib/zodError";

/**
 * パスワードリセットフォームのフィールド名の型
 */
type ResetPasswordFields = keyof z.infer<typeof resetPasswordSchema>;

/**
 * パスワードリセットアクションのエラーレスポンスのフィールドエラー型
 */
type FieldErrors = Partial<Record<ResetPasswordFields, string[]>> & {
  _form?: string[];
};

/**
 * パスワードリセットアクションの結果型
 * @property {boolean} success - パスワードリセット要求が成功したかどうか
 * @property {string} message - 成功時のメッセージ
 * @property {FieldErrors} errors - バリデーションまたはサーバーエラーの詳細
 */
export type ResetPasswordActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      errors: FieldErrors;
    };

/**
 * パスワードリセット要求アクション (Server Action)
 *
 * フォームデータをバリデーションし、パスワードリセット用のメールを送信します。
 * セキュリティ上の理由から、未登録のメールアドレスでも同じ成功メッセージを返します。
 *
 * @param {ResetPasswordActionResult} prevState - 前の状態 (useActionStateで使用)
 * @param {FormData} formData - パスワードリセットフォームのデータ (email)
 * @returns {Promise<ResetPasswordActionResult>} 成功メッセージまたはエラー情報を含む結果
 */
export async function resetPasswordAction(
  prevState: ResetPasswordActionResult,
  formData: FormData
): Promise<ResetPasswordActionResult> {
  const raw = {
    email: formData.get("email"),
  };

  const parsed = resetPasswordSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: toFieldErrors(parsed.error),
    };
  }

  try {
    await resetPassword(parsed.data);
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : "エラーが発生しました。時間をおいて再度お試しください。";

    return {
      success: false,
      errors: {
        _form: [message],
      },
    };
  }

  return {
    success: true,
    message:
      "パスワードリセット用のメールを送信しました。メールをご確認ください。",
  };
}
