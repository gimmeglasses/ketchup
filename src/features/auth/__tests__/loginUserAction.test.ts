/**
 * loginUserAction のテストスイート
 * ユーザーログイン処理の入力検証とサービス呼び出しが正しく動作することを確認
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { LoginActionResult, loginUserAction } from "../actions/loginUserAction";
import { redirect } from "next/navigation";
import * as service from "../services/loginUser";
import type { User, Session } from "@supabase/supabase-js";

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
          signInWithPassword: vi.fn().mockResolvedValue({
            data: {
              user: { id: "fake-user-id" },
              session: { token: "fake-token" },
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

const fakeSession: Session = {
  access_token: "fake-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: "fake-refresh",
  user: fakeUser,
};

// loginUserサービスをスパイ化してモック動作を設定
vi.spyOn(service, "loginUser").mockResolvedValue({
  user: fakeUser,
  session: fakeSession,
});

const initialState: LoginActionResult = {
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

describe("loginUserAction", () => {
  // ✅ 正常系：全ての入力値が妥当な場合
  it("妥当な入力の場合はloginUserが1回呼ばれ、/dashboardにリダイレクトすること", async () => {
    await loginUserAction(
      initialState,
      makeFormData({
        email: "test@example.com",
        password: "password123",
      })
    );

    expect(service.loginUser).toHaveBeenCalledTimes(1);
    expect(service.loginUser).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });

  // ❌ 検証エラー：メールアドレス形式が不正な場合
  it("メールアドレス形式が不正な場合はemailのエラーを返すこと", async () => {
    const result = await loginUserAction(
      initialState,
      makeFormData({
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
    expect(service.loginUser).not.toHaveBeenCalled();
  });

  // ❌ 検証エラー：メールアドレスが空の場合
  it("メールアドレスが空の場合はemailのエラーを返すこと", async () => {
    const result = await loginUserAction(
      initialState,
      makeFormData({
        email: "",
        password: "password123",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toBeDefined();
    }
    expect(service.loginUser).not.toHaveBeenCalled();
  });

  // ❌ 検証エラー：パスワードが短い場合
  it("パスワードが短い場合はpasswordのエラーを返すこと", async () => {
    const result = await loginUserAction(
      initialState,
      makeFormData({
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
    expect(service.loginUser).not.toHaveBeenCalled();
  });

  // ❌ 検証エラー：パスワードが空の場合
  it("パスワードが空の場合はpasswordのエラーを返すこと", async () => {
    const result = await loginUserAction(
      initialState,
      makeFormData({
        email: "test@example.com",
        password: "",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.password).toBeDefined();
    }
    expect(service.loginUser).not.toHaveBeenCalled();
  });

  // ❌ 検証エラー：複数のフィールドにエラーがある場合
  it("複数のフィールドにエラーがある場合、すべてのエラーを返すこと", async () => {
    const result = await loginUserAction(
      initialState,
      makeFormData({
        email: "invalid-email",
        password: "short",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
    }
    expect(service.loginUser).not.toHaveBeenCalled();
  });

  // ✅ 境界値テスト：パスワードがちょうど8文字の場合
  it("パスワードがちょうど8文字の場合は成功すること", async () => {
    await loginUserAction(
      initialState,
      makeFormData({
        email: "test@example.com",
        password: "12345678",
      })
    );

    expect(service.loginUser).toHaveBeenCalledTimes(1);
  });

  // ✅ エッジケース：メールアドレスに特殊文字が含まれる場合
  it("メールアドレスに特殊文字が含まれる場合は成功すること", async () => {
    await loginUserAction(
      initialState,
      makeFormData({
        email: "test+tag@example.com",
        password: "password123",
      })
    );

    expect(service.loginUser).toHaveBeenCalledWith({
      email: "test+tag@example.com",
      password: "password123",
    });
  });

  // ❌ エラーハンドリング：loginUserがエラーをスローした場合
  it("loginUserがエラーをスローした場合、_formエラーを返すこと", async () => {
    vi.spyOn(service, "loginUser").mockRejectedValueOnce(
      new Error("Invalid login credentials")
    );

    const result = await loginUserAction(
      initialState,
      makeFormData({
        email: "test@example.com",
        password: "password123",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors._form).toContain("Invalid login credentials");
    }
  });

  // ❌ エラーハンドリング：不明なエラーの場合
  it("不明なエラーが発生した場合、デフォルトエラーメッセージを返すこと", async () => {
    vi.spyOn(service, "loginUser").mockRejectedValueOnce("Unknown error");

    const result = await loginUserAction(
      initialState,
      makeFormData({
        email: "test@example.com",
        password: "password123",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors._form).toContain(
        "ログインに失敗しました。時間をおいて再度お試しください。"
      );
    }
  });

  // ❌ 検証エラー：メールアドレスが254文字を超える場合
  it("メールアドレスが254文字を超える場合はemailのエラーを返すこと", async () => {
    const longEmail = "a".repeat(250) + "@example.com"; // 263文字

    const result = await loginUserAction(
      initialState,
      makeFormData({
        email: longEmail,
        password: "password123",
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toContain(
        "メールアドレスは254文字以内で入力してください"
      );
    }
    expect(service.loginUser).not.toHaveBeenCalled();
  });

  // ✅ 境界値テスト：メールアドレスがちょうど254文字の場合
  it("メールアドレスがちょうど254文字の場合は成功すること", async () => {
    // 254文字のメールアドレスを生成 (example.com = 11文字, @ = 1文字, なので242文字 + @ + 11 = 254)
    const exactEmail = "a".repeat(242) + "@example.com";

    await loginUserAction(
      initialState,
      makeFormData({
        email: exactEmail,
        password: "password123",
      })
    );

    expect(service.loginUser).toHaveBeenCalledTimes(1);
  });

  // ❌ エラーハンドリング：FormDataにnullが含まれる場合
  it("FormDataにnullが含まれる場合は適切にハンドリングすること", async () => {
    const fd = new FormData();
    // FormDataに値を設定しない場合、get()はnullを返す

    const result = await loginUserAction(initialState, fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
    }
  });
});
