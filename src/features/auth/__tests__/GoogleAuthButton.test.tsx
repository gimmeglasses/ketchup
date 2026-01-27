/**
 * GoogleAuthButton のテストスイート
 * Google OAuth認証ボタンコンポーネントの動作を確認
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoogleAuthButton } from "../components/GoogleAuthButton";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import "@testing-library/jest-dom/vitest";

// useGoogleAuthフックのモック
const mockSignInWithGoogle = vi.fn();

vi.mock("@/features/auth/hooks/useGoogleAuth", () => ({
  useGoogleAuth: vi.fn(() => ({
    isLoading: false,
    error: null,
    signInWithGoogle: mockSignInWithGoogle,
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
  // デフォルトの状態にリセット
  vi.mocked(useGoogleAuth).mockReturnValue({
    isLoading: false,
    error: null,
    signInWithGoogle: mockSignInWithGoogle,
  });
});

describe("GoogleAuthButton", () => {
  it("labelが正しく表示される", () => {
    render(<GoogleAuthButton label="Googleでログイン" />);

    expect(screen.getByRole("button")).toHaveTextContent("Googleでログイン");
  });

  it("カスタムloadingLabelが正しく表示される", () => {
    vi.mocked(useGoogleAuth).mockReturnValue({
      isLoading: true,
      error: null,
      signInWithGoogle: mockSignInWithGoogle,
    });

    render(
      <GoogleAuthButton label="Googleでログイン" loadingLabel="処理中..." />
    );

    expect(screen.getByRole("button")).toHaveTextContent("処理中...");
  });

  it("デフォルトのloadingLabelが表示される", () => {
    vi.mocked(useGoogleAuth).mockReturnValue({
      isLoading: true,
      error: null,
      signInWithGoogle: mockSignInWithGoogle,
    });

    render(<GoogleAuthButton label="Googleでログイン" />);

    expect(screen.getByRole("button")).toHaveTextContent("認証中...");
  });

  it("ボタンクリックでsignInWithGoogleが呼び出される", async () => {
    const user = userEvent.setup();
    render(<GoogleAuthButton label="Googleでログイン" />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it("ローディング中はボタンが無効化される", () => {
    vi.mocked(useGoogleAuth).mockReturnValue({
      isLoading: true,
      error: null,
      signInWithGoogle: mockSignInWithGoogle,
    });

    render(<GoogleAuthButton label="Googleでログイン" />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("ローディング中でない場合はボタンが有効", () => {
    render(<GoogleAuthButton label="Googleでログイン" />);

    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
  });

  it("エラーメッセージが表示される", () => {
    const errorMessage = "Google認証に失敗しました。もう一度お試しください。";
    vi.mocked(useGoogleAuth).mockReturnValue({
      isLoading: false,
      error: errorMessage,
      signInWithGoogle: mockSignInWithGoogle,
    });

    render(<GoogleAuthButton label="Googleでログイン" />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("エラーがない場合はエラーメッセージが表示されない", () => {
    render(<GoogleAuthButton label="Googleでログイン" />);

    const errorText = screen.queryByText(
      /Google認証に失敗しました。もう一度お試しください。/
    );
    expect(errorText).not.toBeInTheDocument();
  });

  it("type属性がbuttonになっている", () => {
    render(<GoogleAuthButton label="Googleでログイン" />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });

  it("Googleアイコンが表示される", () => {
    render(<GoogleAuthButton label="Googleでログイン" />);

    const svg = screen.getByRole("button").querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("h-5", "w-5");
  });

  it("異なるlabelでレンダリングできる", () => {
    render(<GoogleAuthButton label="Googleで登録" />);

    expect(screen.getByRole("button")).toHaveTextContent("Googleで登録");
  });

  it("ローディング中にボタンをクリックしても再度呼び出されない", async () => {
    vi.mocked(useGoogleAuth).mockReturnValue({
      isLoading: true,
      error: null,
      signInWithGoogle: mockSignInWithGoogle,
    });

    const user = userEvent.setup();
    render(<GoogleAuthButton label="Googleでログイン" />);

    const button = screen.getByRole("button");
    await user.click(button);

    // disabledなのでクリックイベントは発火しない
    expect(mockSignInWithGoogle).not.toHaveBeenCalled();
  });
});
