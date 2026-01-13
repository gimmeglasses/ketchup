import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Next.js ミドルウェア - 認証状態をチェックして保護されたルートへのアクセスを制御します
 *
 * ランディングページ（/, /terms, /privacy）と認証ページ（/auth/*）は認証不要でアクセス可能。
 * その他のページはSupabaseセッションが必要で、未認証の場合は /auth/login にリダイレクトします。
 *
 * @param {NextRequest} req - Next.jsリクエストオブジェクト
 * @returns {Promise<NextResponse>} レスポンスまたはリダイレクト
 */
export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const { pathname } = url;

  const isLandingPath =
    pathname === "/" ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy");

  const isAuthPath = pathname.startsWith("/auth");

  if (isLandingPath || isAuthPath) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // セッション（user）がなければ /auth/login へ
  if (!user) {
    const redirectUrl = new URL("/auth/login", req.url);
    redirectUrl.searchParams.set("redirect_to", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

/**
 * ミドルウェアの設定
 *
 * Next.jsの静的アセット、画像、faviconを除くすべてのパスに対してミドルウェアを実行します。
 * API routesは除外されます。
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)"],
};
