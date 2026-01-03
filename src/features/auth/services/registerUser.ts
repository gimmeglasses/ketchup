import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { RegisterInput } from "../validations/registerSchema";

const SUPABASE_ERROR_MESSAGES: Record<string, string> = {
  "User already registered": "このメールアドレスは既に登録されています",
};

function translateSupabaseError(message: string) {
  for (const key in SUPABASE_ERROR_MESSAGES) {
    if (message.includes(key)) return SUPABASE_ERROR_MESSAGES[key];
  }
  return message;
}

/**
 * Supabase Auth 経由でユーザー登録を行い、既知のエラーメッセージを日本語に変換します。
 * @param input 検証済みの登録入力（email / password / name）
 * @returns Supabase の signUp が返すデータ
 * @throws Supabase からエラーが返却された場合、日本語に変換したメッセージ付きで Error を投げます
 */
export async function registerUser(input: RegisterInput) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { name: input.name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  });

  if (error) {
    throw new Error(translateSupabaseError(error.message));
  }

  return data;
}
