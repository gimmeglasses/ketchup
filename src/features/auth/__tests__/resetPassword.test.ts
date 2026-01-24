/**
 * resetPassword サービスのテストスイート
 * Supabase認証呼び出しとエラーハンドリングを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { resetPassword } from "../services/resetPassword";

// Supabaseクライアントのモック
const mockResetPasswordForEmail = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(() => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  })),
}));

describe("resetPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ✅ 正常系
  it("正常な入力で resetPasswordForEmail が成功した場合、エラーなく完了すること", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    await expect(
      resetPassword({
        email: "test@example.com",
      })
    ).resolves.toBeUndefined();

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      "test@example.com",
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
      }
    );
  });

  // ❌ エラー: レート制限超過
  it("レート制限超過の場合、日本語エラーメッセージをスローすること", async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: "Email rate limit exceeded" },
    });

    await expect(
      resetPassword({
        email: "test@example.com",
      })
    ).rejects.toThrow(
      "メール送信の上限に達しました。しばらくしてから再度お試しください"
    );
  });

  // ❌ エラー: 未知のエラー
  it("未知のSupabaseエラーの場合、元のメッセージをスローすること", async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: "Unknown database error" },
    });

    await expect(
      resetPassword({
        email: "test@example.com",
      })
    ).rejects.toThrow("Unknown database error");
  });

  // ✅ 複数のエラーパターン: "Email rate limit exceeded" が含まれる場合
  it("エラーメッセージに 'Email rate limit exceeded' が含まれる場合、日本語変換すること", async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: {
        message: "Error: Email rate limit exceeded. Please try again later.",
      },
    });

    await expect(
      resetPassword({
        email: "test@example.com",
      })
    ).rejects.toThrow(
      "メール送信の上限に達しました。しばらくしてから再度お試しください"
    );
  });

  // ✅ 正しいパラメータでSupabaseを呼び出すこと
  it("emailとredirectToを正しくSupabaseに渡すこと", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    await resetPassword({
      email: "user@example.com",
    });

    expect(mockResetPasswordForEmail).toHaveBeenCalledTimes(1);
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      "user@example.com",
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
      }
    );
  });

  // ✅ 特殊文字を含むメールアドレス
  it("特殊文字を含むメールアドレスでも正常に動作すること", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    await resetPassword({
      email: "test+tag@example.com",
    });

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      "test+tag@example.com",
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
      }
    );
  });
});
