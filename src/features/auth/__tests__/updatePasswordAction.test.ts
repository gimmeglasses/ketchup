/**
 * updatePasswordAction のテストスイート
 * パスワード更新処理の入力検証とサービス呼び出しが正しく動作することを確認
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  UpdatePasswordActionResult,
  updatePasswordAction,
} from "../actions/updatePasswordAction";
import { redirect } from "next/navigation";
import * as service from "../services/updatePassword";
import type { User } from "@supabase/supabase-js";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// 各テスト実行後、モックをリセット
afterEach(() => {
  vi.clearAllMocks();
});

// Supabase クライアントのモック化
vi.mock("@/lib/supabase/server", () => {
  return {
    createSupabaseServerClient: vi.fn(() => {
      return {
        auth: {
          updateUser: vi.fn().mockResolvedValue({
            data: {
              user: { id: "fake-user-id" },
            },
            error: null,
          }),
        },
      };
    }),
  };
});

const fakeUser: User = {
  id: "fake-user-id",
  aud: "authenticated",
  email: "test@example.com",
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  role: "authenticated",
};

// updatePasswordサービスをスパイ化してモック動作を設定
vi.spyOn(service, "updatePassword").mockResolvedValue({
  user: fakeUser,
});

const initialState: UpdatePasswordActionResult = {
  success: false,
  errors: {},
};

/**
 * FormData オブジェクトを生成するヘルパー関数
 */
function makeFormData(values: Record<string, string>) {
  const fd = new FormData();
  Object.entries(values).forEach(([key, value]) => fd.append(key, value));
  return fd;
}

describe("updatePasswordAction", () => {
  // ✅ 正常系：全ての入力値が妥当な場合
  it("妥当な入力の場合はupdatePasswordが1回呼ばれ、/auth/loginにリダイレクトすること", async () => {
    await updatePasswordAction(
      initialState,
      makeFormData({
        password: "newPassword123",
        passwordConfirmation: "newPassword123",
      })
    );

    expect(service.updatePassword).toHaveBeenCalledTimes(1);
    expect(service.updatePassword).toHaveBeenCalledWith({
      password: "newPassword123",
      passwordConfirmation: "newPassword123",
    });
    expect(redirect).toHaveBeenCalledWith("/auth/login");
  });

  // ❌ 検証エラー：パスワードが短い場合
  it("パスワードが8文字未満の場合はpasswordのエラーを返すこと", async () => {
    const result = await updatePasswordAction(
      initialState,
      makeFormData({
        password: "short",
        passwordConfirmation: "short",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.password).toContain(
        "パスワードは8文字以上で入力してください"
      );
    }
    expect(service.updatePassword).not.toHaveBeenCalled();
  });

  // ❌ 検証エラー：パスワードが空の場合
  it("パスワードが空の場合はpasswordのエラーを返すこと", async () => {
    const result = await updatePasswordAction(
      initialState,
      makeFormData({
        password: "",
        passwordConfirmation: "",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.password).toBeDefined();
    }
    expect(service.updatePassword).not.toHaveBeenCalled();
  });

  // ❌ 検証エラー：パスワードが一致しない場合
  it("パスワードが一致しない場合はpasswordConfirmationのエラーを返すこと", async () => {
    const result = await updatePasswordAction(
      initialState,
      makeFormData({
        password: "password123",
        passwordConfirmation: "password456",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.passwordConfirmation).toContain(
        "パスワードが一致しません"
      );
    }
    expect(service.updatePassword).not.toHaveBeenCalled();
  });

  // ✅ 境界値テスト：パスワードがちょうど8文字の場合
  it("パスワードがちょうど8文字の場合は成功すること", async () => {
    await updatePasswordAction(
      initialState,
      makeFormData({
        password: "12345678",
        passwordConfirmation: "12345678",
      })
    );

    expect(service.updatePassword).toHaveBeenCalledTimes(1);
  });

  // ❌ エラーハンドリング：updatePasswordがエラーをスローした場合
  it("updatePasswordがエラーをスローした場合、_formエラーを返すこと", async () => {
    vi.spyOn(service, "updatePassword").mockRejectedValueOnce(
      new Error("Invalid token")
    );

    const result = await updatePasswordAction(
      initialState,
      makeFormData({
        password: "newPassword123",
        passwordConfirmation: "newPassword123",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors._form).toContain("Invalid token");
    }
  });

  // ❌ エラーハンドリング：不明なエラーの場合
  it("不明なエラーが発生した場合、デフォルトエラーメッセージを返すこと", async () => {
    vi.spyOn(service, "updatePassword").mockRejectedValueOnce("Unknown error");

    const result = await updatePasswordAction(
      initialState,
      makeFormData({
        password: "newPassword123",
        passwordConfirmation: "newPassword123",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors._form).toContain(
        "パスワードの更新に失敗しました。時間をおいて再度お試しください。"
      );
    }
  });

  // ❌ 検証エラー：passwordConfirmationが空の場合
  it("passwordConfirmationが空の場合はpasswordConfirmationのエラーを返すこと", async () => {
    const result = await updatePasswordAction(
      initialState,
      makeFormData({
        password: "password123",
        passwordConfirmation: "",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.passwordConfirmation).toBeDefined();
    }
    expect(service.updatePassword).not.toHaveBeenCalled();
  });

  // ❌ エラーハンドリング：FormDataにnullが含まれる場合
  it("FormDataにnullが含まれる場合は適切にハンドリングすること", async () => {
    const fd = new FormData();
    // FormDataに値を設定しない場合、get()はnullを返す

    const result = await updatePasswordAction(initialState, fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.password).toBeDefined();
    }
  });

  // ✅ 長いパスワード：100文字のパスワード
  it("100文字のパスワードでも成功すること", async () => {
    const longPassword = "a".repeat(100);

    await updatePasswordAction(
      initialState,
      makeFormData({
        password: longPassword,
        passwordConfirmation: longPassword,
      })
    );

    expect(service.updatePassword).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith("/auth/login");
  });
});
