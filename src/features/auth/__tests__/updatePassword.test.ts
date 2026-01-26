/**
 * updatePassword サービスのテストスイート
 * Supabase認証呼び出しとエラーハンドリングを検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { updatePassword } from "../services/updatePassword";

// Supabaseクライアントのモック
const mockUpdateUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(() => ({
    auth: {
      updateUser: mockUpdateUser,
    },
  })),
}));

describe("updatePassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ✅ 正常系
  it("正常な入力で updateUser が成功した場合、エラーなく完了すること", async () => {
    mockUpdateUser.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });

    await expect(
      updatePassword({
        password: "newPassword123",
        passwordConfirmation: "newPassword123",
      })
    ).resolves.toBeUndefined();
    expect(mockUpdateUser).toHaveBeenCalledWith({
      password: "newPassword123",
    });
  });

  // ❌ エラー: 新しいパスワードが現在のパスワードと同じ
  it("新しいパスワードが現在のパスワードと同じ場合、日本語エラーメッセージをスローすること", async () => {
    mockUpdateUser.mockResolvedValue({
      data: null,
      error: { message: "New password should be different" },
    });

    await expect(
      updatePassword({
        password: "password123",
        passwordConfirmation: "password123",
      })
    ).rejects.toThrow(
      "新しいパスワードは現在のパスワードと異なる必要があります"
    );
  });

  // ❌ エラー: パスワードが短すぎる
  it("パスワードが8文字未満の場合、日本語エラーメッセージをスローすること", async () => {
    mockUpdateUser.mockResolvedValue({
      data: null,
      error: { message: "Password should be at least 8 characters" },
    });

    await expect(
      updatePassword({
        password: "1234567",
        passwordConfirmation: "1234567",
      })
    ).rejects.toThrow("パスワードは8文字以上で入力してください");
  });

  // ❌ エラー: トークンが無効
  it("トークンが無効な場合、日本語エラーメッセージをスローすること", async () => {
    mockUpdateUser.mockResolvedValue({
      data: null,
      error: { message: "Invalid token" },
    });

    await expect(
      updatePassword({
        password: "newPassword123",
        passwordConfirmation: "newPassword123",
      })
    ).rejects.toThrow(
      "リセット用のリンクが無効です。再度パスワードリセットを行ってください"
    );
  });

  // ❌ エラー: トークンの有効期限切れ
  it("トークンの有効期限が切れている場合、日本語エラーメッセージをスローすること", async () => {
    mockUpdateUser.mockResolvedValue({
      data: null,
      error: { message: "Token has expired" },
    });

    await expect(
      updatePassword({
        password: "newPassword123",
        passwordConfirmation: "newPassword123",
      })
    ).rejects.toThrow(
      "リセット用のリンクの有効期限が切れています。再度パスワードリセットを行ってください"
    );
  });

  // ❌ エラー: 未知のエラー
  it("未知のSupabaseエラーの場合、元のメッセージをスローすること", async () => {
    mockUpdateUser.mockResolvedValue({
      data: null,
      error: { message: "Unknown database error" },
    });

    await expect(
      updatePassword({
        password: "newPassword123",
        passwordConfirmation: "newPassword123",
      })
    ).rejects.toThrow("Unknown database error");
  });

  // ✅ 複数のエラーパターン: "Invalid token" が含まれる場合
  it("エラーメッセージに 'Invalid token' が含まれる場合、日本語変換すること", async () => {
    mockUpdateUser.mockResolvedValue({
      data: null,
      error: {
        message: "Error: Invalid token provided for password reset",
      },
    });

    await expect(
      updatePassword({
        password: "newPassword123",
        passwordConfirmation: "newPassword123",
      })
    ).rejects.toThrow(
      "リセット用のリンクが無効です。再度パスワードリセットを行ってください"
    );
  });

  // ✅ 正しいパラメータでSupabaseを呼び出すこと
  it("passwordを正しくSupabaseに渡すこと", async () => {
    mockUpdateUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    await updatePassword({
      password: "securePassword123",
      passwordConfirmation: "securePassword123",
    });

    expect(mockUpdateUser).toHaveBeenCalledTimes(1);
    expect(mockUpdateUser).toHaveBeenCalledWith({
      password: "securePassword123",
    });
  });
});
