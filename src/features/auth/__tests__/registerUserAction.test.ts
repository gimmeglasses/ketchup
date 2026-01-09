/**
 * registerUserAction のテストスイート
 * ユーザー登録処理の入力検証とサービス呼び出しが正しく動作することを確認
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  RegisterActionResult,
  registerUserAction,
} from "../actions/registerUserAction";
import { redirect } from "next/navigation";
import * as service from "../services/registerUser";

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
          signUp: vi.fn().mockResolvedValue({
            data: { user: { id: "fake-user-id" } },
            error: null,
          }),
        },
      };
    }),
  };
});

// registerUserサービスをスパイ化してモック動作を設定
vi.spyOn(service, "registerUser").mockResolvedValue({
  user: { id: "fake-user-id", email: "test@example.com" },
  session: null,
});

const initialState: RegisterActionResult = {
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

describe("registerUserAction", () => {
  // ✅ 正常系：全ての入力値が妥当な場合
  it("妥当な入力の場合はsuccess: trueを返し、registerUserが1回呼ばれること", async () => {
    await registerUserAction(
      initialState,
      makeFormData({
        name: "Ketchup",
        email: "test@example.com",
        password: "password123",
      })
    );

    expect(service.registerUser).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith("/auth/register/success");
  });

  // ❌ 検証エラー：名前が空の場合
  it("名前が空の場合はsuccess: falseとnameのエラーを返し、registerUserを呼ばないこと", async () => {
    const result = await registerUserAction(
      initialState,
      makeFormData({
        name: "",
        email: "test@example.com",
        password: "password123",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.name).toContain("名前を入力してください");
    }
    expect(service.registerUser).not.toHaveBeenCalled();
  });

  // ❌ 検証エラー：メールアドレス形式が不正な場合
  it("メールアドレス形式が不正な場合はemailのエラーを返すこと", async () => {
    const result = await registerUserAction(
      initialState,
      makeFormData({
        name: "Ketchup",
        email: "invalid-email",
        password: "password123",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toContain(
        "有効なメールアドレスを入力してください"
      );
    }
    expect(service.registerUser).not.toHaveBeenCalled();
  });

  // ❌ 検証エラー：パスワードが短い場合
  it("パスワードが短い場合はpasswordのエラーを返すこと", async () => {
    const result = await registerUserAction(
      initialState,
      makeFormData({
        name: "Ketchup",
        email: "test@example.com",
        password: "short",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.password).toContain(
        "パスワードは8文字以上で入力してください"
      );
    }
    expect(service.registerUser).not.toHaveBeenCalled();
  });

  it("複数のフィールドにエラーがある場合、すべてのエラーを返すこと", async () => {
    const result = await registerUserAction(
      initialState,
      makeFormData({
        name: "",
        email: "invalid-email",
        password: "short",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.name).toBeDefined();
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
    }
  });

  it("パスワードがちょうど8文字の場合は成功すること", async () => {
    await registerUserAction(
      initialState,
      makeFormData({
        name: "Ketchup",
        email: "test@example.com",
        password: "12345678",
      })
    );

    expect(service.registerUser).toHaveBeenCalledTimes(1);
  });

  it("registerUserがエラーをスローした場合、適切にハンドリングすること", async () => {
    vi.spyOn(service, "registerUser").mockRejectedValueOnce(
      new Error("Database error")
    );

    const result = await registerUserAction(
      initialState,
      makeFormData({
        name: "Ketchup",
        email: "test@example.com",
        password: "password123",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors._form).toContain(
        "Database error"
      );
    }
  });

  it("メールアドレスに特殊文字が含まれる場合", async () => {
    await registerUserAction(
      initialState,
      makeFormData({
        name: "Ketchup",
        email: "test+tag@example.com",
        password: "password123",
      })
    );

    expect(service.registerUser).toHaveBeenCalled();
  });

  it("名前にスペースのみが含まれる場合", async () => {
    const result = await registerUserAction(
      initialState,
      makeFormData({
        name: "   ",
        email: "test@example.com",
        password: "password123",
      })
    );

    expect(result.success).toBe(false);
  });
});
