"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  resetPasswordAction,
  type ResetPasswordActionResult,
} from "@/features/auth/actions/resetPasswordAction";

const initialState: ResetPasswordActionResult = {
  success: false,
  errors: {},
};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState<
    ResetPasswordActionResult,
    FormData
  >(resetPasswordAction, initialState);

  return (
    <div className="w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-xl shadow-red-200">
      <h1 className="text-center text-2xl font-bold text-red-800">
        パスワードリセット
      </h1>
      <p className="mt-2 text-center text-sm text-red-900/70">
        登録済みのメールアドレスを入力してください。
        <br />
        パスワードリセット用のリンクをお送りします。
      </p>

      {/* 成功時はメッセージのみ表示 */}
      {state.success ? (
        <div className="mt-6">
          <div className="rounded-xl bg-green-50 p-3 text-center text-sm text-green-700">
            {state.message}
          </div>
          <p className="mt-4 text-center text-xs text-red-900/70">
            <Link
              href="/auth/login"
              className="font-semibold text-red-700 underline-offset-2 hover:underline"
            >
              ログイン画面に戻る
            </Link>
          </p>
        </div>
      ) : (
        <>
          <form className="mt-6 space-y-4" action={formAction}>
            {/* フォーム共通エラー */}
            {state.errors._form && (
              <p className="text-center text-sm text-red-500">
                {state.errors._form[0]}
              </p>
            )}

            {/* メールアドレス */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-red-900"
              >
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-950 shadow-sm outline-none ring-red-400/70 placeholder:text-red-300 focus:border-red-400 focus:ring-2"
                placeholder="you@example.com"
              />
              {state.errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={pending}
              className="mt-2 w-full rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-700/40 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:opacity-60"
            >
              {pending ? "送信中..." : "リセットメールを送信"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-red-900/70">
            <Link
              href="/auth/login"
              className="font-semibold text-red-700 underline-offset-2 hover:underline"
            >
              ログイン画面に戻る
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
