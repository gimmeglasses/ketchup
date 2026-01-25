import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UpdatePasswordInput } from "../validations/updatePasswordSchema";

/**
 * Supabaseからのパスワード更新エラーメッセージを日本語に変換するマッピング
 */
const SUPABASE_UPDATE_ERROR_MESSAGES: Record<string, string> = {
  "New password should be different":
    "新しいパスワードは現在のパスワードと異なる必要があります",
  "Password should be at least 8 characters":
    "パスワードは8文字以上で入力してください",
  "Invalid token":
    "リセット用のリンクが無効です。再度パスワードリセットを行ってください",
  "Token has expired":
    "リセット用のリンクの有効期限が切れています。再度パスワードリセットを行ってください",
};

/**
 * Supabaseのエラーメッセージを日本語に変換します
 *
 * @param {string} message - Supabaseからのエラーメッセージ
 * @returns {string} 日本語に変換されたメッセージ、マッピングがない場合は元のメッセージを返す
 */
function translateSupabaseUpdateError(message: string) {
  for (const [key, translated] of Object.entries(
    SUPABASE_UPDATE_ERROR_MESSAGES
  )) {
    if (message.includes(key)) return translated;
  }
  return message;
}

/**
 * Supabase Auth 経由でユーザーのパスワードを更新します
 *
 * @param {UpdatePasswordInput} input - パスワード更新入力（password, passwordConfirmation）
 * @returns {Promise<void>} エラーがなければundefinedを返す
 * @throws {Error} Supabaseからエラーが返った場合、日本語に変換したメッセージ付きでエラーを投げます
 */
export async function updatePassword(input: UpdatePasswordInput) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.updateUser({
    password: input.password,
  });

  if (error) {
    throw new Error(translateSupabaseUpdateError(error.message));
  }
}
