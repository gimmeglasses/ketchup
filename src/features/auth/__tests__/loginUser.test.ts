/**
 * loginUser サービスのテストスイート
 * Supabase認証呼び出しとエラーハンドリングを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginUser } from "../services/loginUser";

// Supabaseクライアントのモック
const mockSignInWithPassword = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  })),
}));

describe("loginUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ✅ 正常系
  it("正常な入力で signInWithPassword が成功した場合、dataを返すこと", async () => {
    const mockData = {
      user: { id: "user-123", email: "test@example.com" },
      session: { access_token: "fake-token" },
    };
    mockSignInWithPassword.mockResolvedValue({ data: mockData, error: null });

    const result = await loginUser({
      email: "test@example.com",
      password: "password123",
    });

    expect(result).toEqual(mockData);
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  // ❌ エラー: メールアドレスが確認されていない
  it("メールアドレスが確認されていない場合、日本語エラーメッセージをスローすること", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: { message: "Email not confirmed" },
    });

    await expect(
      loginUser({
        email: "unconfirmed@example.com",
        password: "password123",
      })
    ).rejects.toThrow("メールアドレスが確認されていません");
  });

  // ❌ エラー: 認証情報が無効
  it("認証情報が無効な場合、日本語エラーメッセージをスローすること", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: { message: "Invalid login credentials" },
    });

    await expect(
      loginUser({
        email: "test@example.com",
        password: "wrongpassword",
      })
    ).rejects.toThrow("メールアドレスまたはパスワードが正しくありません");
  });

  // ❌ エラー: 未知のエラー
  it("未知のSupabaseエラーの場合、元のメッセージをスローすること", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: { message: "Unknown database error" },
    });

    await expect(
      loginUser({
        email: "test@example.com",
        password: "password123",
      })
    ).rejects.toThrow("Unknown database error");
  });

  // ✅ 複数のエラーパターン: "Email not confirmed" が含まれる場合
  it("エラーメッセージに 'Email not confirmed' が含まれる場合、日本語変換すること", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: {
        message: "Error: Email not confirmed. Please check your email.",
      },
    });

    await expect(
      loginUser({
        email: "test@example.com",
        password: "password123",
      })
    ).rejects.toThrow("メールアドレスが確認されていません");
  });

  // ✅ 複数のエラーパターン: "Invalid login credentials" が含まれる場合
  it("エラーメッセージに 'Invalid login credentials' が含まれる場合、日本語変換すること", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: {
        message:
          "Authentication failed: Invalid login credentials provided by user",
      },
    });

    await expect(
      loginUser({
        email: "test@example.com",
        password: "password123",
      })
    ).rejects.toThrow("メールアドレスまたはパスワードが正しくありません");
  });

  // ✅ 正しいパラメータでSupabaseを呼び出すこと
  it("emailとpasswordを正しくSupabaseに渡すこと", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: "user-123" }, session: { access_token: "token" } },
      error: null,
    });

    await loginUser({
      email: "user@example.com",
      password: "securePassword123",
    });

    expect(mockSignInWithPassword).toHaveBeenCalledTimes(1);
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "securePassword123",
    });
  });

  // ✅ 特殊文字を含むメールアドレス
  it("特殊文字を含むメールアドレスでも正常に動作すること", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: "user-123" }, session: { access_token: "token" } },
      error: null,
    });

    const result = await loginUser({
      email: "test+tag@example.com",
      password: "password123",
    });

    expect(result).toBeDefined();
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "test+tag@example.com",
      password: "password123",
    });
  });
});
