import { createSupabaseServerClient } from "@/lib/supabase/server";
export type LoginResult = {
  user: {
    id: string;
    email: string;
  };
  // 必要なら session も自前型で追加
};
/**
 * Supabaseからのログインエラーメッセージを日本語に変換するマッピング
 */
const SUPABASE_LOGIN_ERROR_MESSAGES: Record<string, string> = {
  "Email not confirmed": "メールアドレスが確認されていません",
  "Invalid login credentials":
    "メールアドレスまたはパスワードが正しくありません",
};

/**
 * Supabaseのエラーメッセージを日本語に変換します
 *
 * @param {string} message - Supabaseからのエラーメッセージ
 * @returns {string} 日本語に変換されたメッセージ、マッピングがない場合は元のメッセージを返す
 */
function translateSupabaseLoginError(message: string) {
  for (const [key, translated] of Object.entries(SUPABASE_LOGIN_ERROR_MESSAGES)) {
    if (message.includes(key)) return translated;
  }
  return message;
}

/**
 * Supabase Auth 経由でメールアドレス＋パスワードでログインします
 *
 * @param {Object} input - ログイン認証情報
 * @param {string} input.email - メールアドレス
 * @param {string} input.password - パスワード
 * @returns {Promise<Object>} Supabaseの認証データ
 * @throws {Error} Supabaseからエラーが返った場合、日本語に変換したメッセージ付きでエラーを投げます
 */
export async function loginUser(input: { email: string; password: string }) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    throw new Error(translateSupabaseLoginError(error.message));
  }
  return data;
}
