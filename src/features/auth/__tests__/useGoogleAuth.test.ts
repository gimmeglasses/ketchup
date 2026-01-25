/**
 * useGoogleAuth のテストスイート
 * Google OAuth認証フックの動作を確認
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { createBrowserClient } from "@supabase/ssr";

// Supabase クライアントのモック
const mockSignInWithOAuth = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  })),
}));

// 各テスト前にモックをリセット
beforeEach(() => {
  vi.clearAllMocks();
  // window.location.originをモック
  Object.defineProperty(window, "location", {
    value: { origin: "http://localhost:3000" },
    writable: true,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useGoogleAuth", () => {
  it("初期状態が正しく設定されている", () => {
    const { result } = renderHook(() => useGoogleAuth());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.signInWithGoogle).toBe("function");
  });

  it("signInWithGoogle が成功した場合、isLoading が true になる", async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useGoogleAuth());

    act(() => {
      void result.current.signInWithGoogle();
    });

    // ローディング状態になる
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();

    // Supabaseクライアントが正しく呼び出される
    await waitFor(() => {
      expect(createBrowserClient).toHaveBeenCalledWith(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
    });
  });

  it("signInWithGoogle が正しいプロバイダーとオプションで呼び出される", async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useGoogleAuth());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/dashboard",
      },
    });
  });

  it("signInWithGoogle がエラーを返した場合、エラーメッセージが設定される", async () => {
    const mockError = { message: "OAuth error" };
    mockSignInWithOAuth.mockResolvedValue({ error: mockError });

    const { result } = renderHook(() => useGoogleAuth());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(
      "Google認証に失敗しました。もう一度お試しください。"
    );
  });

  it("signInWithGoogle 実行中にエラーがクリアされる", async () => {
    // 最初にエラーを発生させる
    mockSignInWithOAuth.mockResolvedValueOnce({
      error: { message: "OAuth error" },
    });

    const { result } = renderHook(() => useGoogleAuth());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(result.current.error).toBe(
      "Google認証に失敗しました。もう一度お試しください。"
    );

    // 再度実行するとエラーがクリアされる
    mockSignInWithOAuth.mockResolvedValueOnce({ error: null });

    act(() => {
      void result.current.signInWithGoogle();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it("環境変数が正しく使用される", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    mockSignInWithOAuth.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useGoogleAuth());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-anon-key"
    );
  });
});
