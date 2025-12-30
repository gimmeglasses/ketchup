"use server";

import { registerSchema } from "../validations/registerSchema";
import { registerUser } from "../services/registerUser";
import { redirect } from "next/navigation";

export type RegisterActionResult =
  | { success: true }
  | { success: false; errors: Record<string, string[]> };

/**
 * フォームから受け取った登録情報を検証し、Supabase 経由でユーザー作成を実行します。
 * 検証エラーはフィールド単位のエラーとして返し、実行時エラーはフォーム共通エラーとして返します。
 * 成功時は登録完了ページにリダイレクトします。
 * @param prevState サーバーアクションの前回の状態
 * @param formData フォーム送信された FormData
 * @returns 登録結果（成功か、フィールドエラー/共通エラーを含む）
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
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return { success: false, errors: fieldErrors };
  }

  try {
    await registerUser(parsed.data);
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : "登録に失敗しました。時間をおいて再度お試しください。";

    return {
      success: false,
      errors: {
        _form: [message], // フォーム共通エラーとして返す
      },
    };
  }
  await registerUser(parsed.data);
  redirect("/auth/register/success");
  return { success: true };
}
