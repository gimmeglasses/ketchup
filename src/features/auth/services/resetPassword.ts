import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ResetPasswordInput } from "../validations/resetPasswordSchema";

/**
 * Supabaseからのパスワードリセットエラーメッセージを日本語に変換するマッピング
 */
const SUPABASE_RESET_ERROR_MESSAGES: Record<string, string> = {
  "Email rate limit exceeded":
    "メール送信の上限に達しました。しばらくしてから再度お試しください",
};

/**
 * Supabaseのエラーメッセージを日本語に変換します
 *
 * @param {string} message - Supabaseからのエラーメッセージ
 * @returns {string} 日本語に変換されたメッセージ、マッピングがない場合は元のメッセージを返す
 */
function translateSupabaseResetError(message: string) {
  for (const [key, translated] of Object.entries(
    SUPABASE_RESET_ERROR_MESSAGES
  )) {
    if (message.includes(key)) return translated;
  }
  return message;
}

/**
 * Supabase Auth 経由でパスワードリセット用のメールを送信します
 *
 * @param {ResetPasswordInput} input - パスワードリセット入力（email）
 * @returns {Promise<void>} エラーがなければundefinedを返す
 * @throws {Error} Supabaseからエラーが返った場合、日本語に変換したメッセージ付きでエラーを投げます
 */
export async function resetPassword(input: ResetPasswordInput) {
  const supabase = await createSupabaseServerClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error(
      "環境変数 NEXT_PUBLIC_SITE_URL が設定されていません。パスワードリセット用のリダイレクトURLを構成できません。"
    );
  }

  const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo: `${siteUrl}/auth/update-password`,
  });

  if (error) {
    throw new Error(translateSupabaseResetError(error.message));
  }
}
