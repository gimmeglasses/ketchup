import { Page } from "@playwright/test";

/**
 * ブラウザのSupabase認証Cookieからユーザー ID を取得します
 *
 * @supabase/ssr はセッションを単一Cookie（sb-<ref>-auth-token）または
 * チャンク分割Cookie（sb-<ref>-auth-token.0, .1, ...）で保存します。
 * 両方のパターンに対応します。
 */
export async function getUserId(page: Page): Promise<string> {
  const cookies = await page.context().cookies();

  // 単一Cookieを探す
  const single = cookies.find(
    (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"),
  );

  let raw: string;

  if (single) {
    raw = single.value;
  } else {
    // チャンク分割Cookie（.0, .1, ...）を結合する
    const chunks = cookies
      .filter((c) => /^sb-.*-auth-token\.\d+$/.test(c.name))
      .sort((a, b) => {
        const numA = parseInt(a.name.split(".").pop()!);
        const numB = parseInt(b.name.split(".").pop()!);
        return numA - numB;
      });

    if (chunks.length === 0) {
      const names = cookies.map((c) => c.name).join(", ");
      throw new Error(
        `Supabase auth cookie not found. Available cookies: [${names}]`,
      );
    }

    raw = chunks.map((c) => c.value).join("");
  }

  const decoded = Buffer.from(raw.replace(/^base64-/, ""), "base64").toString(
    "utf-8",
  );
  const session = JSON.parse(decoded);
  return session.user.id;
}
