/**
 * registerUser サービスのテストスイート
 * Supabase認証呼び出しとエラーハンドリングを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerUser } from "../services/registerUser";

// Supabaseクライアントのモック
const mockSignUp = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(() => ({
    auth: {
      signUp: mockSignUp,
    },
  })),
}));

describe("registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ✅ 正常系
  it("正常な入力で signUp が成功した場合、dataを返すこと", async () => {
    const mockData = { user: { id: "user-123", email: "test@example.com" } };
    mockSignUp.mockResolvedValue({ data: mockData, error: null });

    const result = await registerUser({
      name: "Ketchup",
      email: "test@example.com",
      password: "password123",
    });

    expect(result).toEqual(mockData);
    expect(mockSignUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
      options: {
        data: { name: "Ketchup" },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      },
    });
  });

  // ❌ エラー:  既存ユーザー
  it("既に登録済みのメールアドレスの場合、日本語エラーメッセージをスローすること", async () => {
    mockSignUp.mockResolvedValue({
      data: null,
      error: { message: "User already registered" },
    });

    await expect(
      registerUser({
        name: "Ketchup",
        email: "existing@example.com",
        password: "password123",
      })
    ).rejects.toThrow("このメールアドレスは既に登録されています");
  });

  // ❌ エラー: 未知のエラー
  it("未知のSupabaseエラーの場合、元のメッセージをスローすること", async () => {
    mockSignUp.mockResolvedValue({
      data: null,
      error: { message: "Unknown database error" },
    });

    await expect(
      registerUser({
        name: "Ketchup",
        email: "test@example.com",
        password: "password123",
      })
    ).rejects.toThrow("Unknown database error");
  });

  // ✅ options の検証
  it("nameがuser metadataに正しく設定されること", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    await registerUser({
      name: "田中太郎",
      email: "tanaka@example.com",
      password: "password123",
    });

    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          data: { name: "田中太郎" },
        }),
      })
    );
  });

  // ✅ emailRedirectTo の検証
  it("emailRedirectToが正しく設定されること", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    mockSignUp.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    await registerUser({
      name: "Ketchup",
      email: "test@example.com",
      password: "password123",
    });

    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: "https://example.com/auth/confirm",
        }),
      })
    );
  });
});
