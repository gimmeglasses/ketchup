/**
 * resetPasswordAction のテストスイート
 * パスワードリセット要求処理の入力検証とサービス呼び出しが正しく動作することを確認
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  ResetPasswordActionResult,
  resetPasswordAction,
} from "../actions/resetPasswordAction";
import * as service from "../services/resetPassword";

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
          resetPasswordForEmail: vi.fn().mockResolvedValue({
            error: null,
          }),
        },
      };
    }),
  };
});

// resetPasswordサービスをスパイ化してモック動作を設定
vi.spyOn(service, "resetPassword").mockResolvedValue(undefined);

const initialState: ResetPasswordActionResult = {
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

describe("resetPasswordAction", () => {
  // ✅ 正常系：全ての入力値が妥当な場合
  it("妥当な入力の場合はresetPasswordが1回呼ばれ、成功レスポンスを返すこと", async () => {
    const result = await resetPasswordAction(
      initialState,
      makeFormData({
        email: "test@example.com",
      })
    );

    expect(service.resetPassword).toHaveBeenCalledTimes(1);
    expect(service.resetPassword).toHaveBeenCalledWith({
      email: "test@example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.message).toBe(
        "パスワードリセット用のメールを送信しました。メールをご確認ください。"
      );
    }
  });

  // ❌ 検証エラー：メールアドレス形式が不正な場合
  it("メールアドレス形式が不正な場合はemailのエラーを返すこと", async () => {
    const result = await resetPasswordAction(
      initialState,
      makeFormData({
        email: "invalid-email",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toContain(
        "有効なメールアドレスを入力してください"
      );
    }
    expect(service.resetPassword).not.toHaveBeenCalled();
  });

  // ❌ 検証エラー：メールアドレスが空の場合
  it("メールアドレスが空の場合はemailのエラーを返すこと", async () => {
    const result = await resetPasswordAction(
      initialState,
      makeFormData({
        email: "",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toBeDefined();
    }
    expect(service.resetPassword).not.toHaveBeenCalled();
  });

  // ✅ エッジケース：メールアドレスに特殊文字が含まれる場合
  it("メールアドレスに特殊文字が含まれる場合は成功すること", async () => {
    const result = await resetPasswordAction(
      initialState,
      makeFormData({
        email: "test+tag@example.com",
      })
    );

    expect(service.resetPassword).toHaveBeenCalledWith({
      email: "test+tag@example.com",
    });
    expect(result.success).toBe(true);
  });

  // ❌ エラーハンドリング：resetPasswordがエラーをスローした場合
  it("resetPasswordがエラーをスローした場合、_formエラーを返すこと", async () => {
    vi.spyOn(service, "resetPassword").mockRejectedValueOnce(
      new Error("Email rate limit exceeded")
    );

    const result = await resetPasswordAction(
      initialState,
      makeFormData({
        email: "test@example.com",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors._form).toContain("Email rate limit exceeded");
    }
  });

  // ❌ エラーハンドリング：不明なエラーの場合
  it("不明なエラーが発生した場合、デフォルトエラーメッセージを返すこと", async () => {
    vi.spyOn(service, "resetPassword").mockRejectedValueOnce("Unknown error");

    const result = await resetPasswordAction(
      initialState,
      makeFormData({
        email: "test@example.com",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors._form).toContain(
        "エラーが発生しました。時間をおいて再度お試しください。"
      );
    }
  });

  // ❌ 検証エラー：メールアドレスが254文字を超える場合
  it("メールアドレスが254文字を超える場合はemailのエラーを返すこと", async () => {
    const longEmail = "a".repeat(250) + "@example.com"; // 263文字

    const result = await resetPasswordAction(
      initialState,
      makeFormData({
        email: longEmail,
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toContain(
        "メールアドレスは254文字以内で入力してください"
      );
    }
    expect(service.resetPassword).not.toHaveBeenCalled();
  });

  // ✅ 境界値テスト：メールアドレスがちょうど254文字の場合
  it("メールアドレスがちょうど254文字の場合は成功すること", async () => {
    // 254文字のメールアドレスを生成 (example.com = 11文字, @ = 1文字, なので242文字 + @ + 11 = 254)
    const exactEmail = "a".repeat(242) + "@example.com";

    const result = await resetPasswordAction(
      initialState,
      makeFormData({
        email: exactEmail,
      })
    );

    expect(service.resetPassword).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  // ❌ エラーハンドリング：FormDataにnullが含まれる場合
  it("FormDataにnullが含まれる場合は適切にハンドリングすること", async () => {
    const fd = new FormData();
    // FormDataに値を設定しない場合、get()はnullを返す

    const result = await resetPasswordAction(initialState, fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toBeDefined();
    }
  });
});
