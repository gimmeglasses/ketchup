import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * サーバーコンポーネント / Server Actions / Route Handlers から
 * Supabase クライアントを使うための共通関数。
 *
 * Fluid Compute 環境ではグローバル変数に保持せず、
 * 必要なたびにこの関数を呼んでクライアントを生成する。
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component から呼ばれた場合など、
            // cookie の set が無視されるケースはここで握りつぶす。
            // セッション更新は middleware などでハンドリングする想定。
          }
        },
      },
    }
  );
}
