"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  loginUserAction,
  type LoginActionResult,
} from "@/features/auth/actions/loginUserAction";
import { AuthDivider } from "@/features/auth/components/AuthDivider";
import { GoogleAuthButton } from "@/features/auth/components/GoogleAuthButton";

const initialState: LoginActionResult = {
  success: false,
  errors: {},
};

export function LoginForm(): React.ReactElement {
  const [state, formAction, pending] = useActionState<
    LoginActionResult,
    FormData
  >(loginUserAction, initialState);

  return (
    <div className="w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-xl shadow-red-200">
      <h1 className="text-center text-2xl font-bold text-red-800">ログイン</h1>
      <p className="mt-2 text-center text-sm text-red-900/70">
        登録済みのメールアドレスとパスワードで Ketchup にログインします。
      </p>

      <GoogleAuthButton label="Googleでログイン" />
      <AuthDivider />

      <form className="mt-6 space-y-4" action={formAction}>
        {/* フォーム共通エラー */}
        {state.success === false && state.errors._form && (
          <p className="mt-3 text-center text-sm text-red-500">
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
          {state.success === false && state.errors.email && (
            <p className="text-red-500 text-sm">{state.errors.email[0]}</p>
          )}
        </div>

        {/* パスワード */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-red-900"
          >
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-950 shadow-sm outline-none ring-red-400/70 placeholder:text-red-300 focus:border-red-400 focus:ring-2"
            placeholder="パスワードを入力"
          />
          {state.success === false && state.errors.password && (
            <p className="text-red-500 text-sm">{state.errors.password[0]}</p>
          )}
        </div>

        {/* ログインボタン */}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-700/40 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-red-900/70">
        アカウントをお持ちでない方は{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-red-700 underline-offset-2 hover:underline"
        >
          新規登録
        </Link>
        してください。
      </p>
    </div>
  );
}
