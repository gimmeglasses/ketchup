"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  registerUserAction,
  type RegisterActionResult,
} from "@/features/auth/actions/registerUserAction";

const initialState: RegisterActionResult = {
  success: false,
  errors: {},
};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<
    RegisterActionResult,
    FormData
  >(registerUserAction, initialState);

  return (
    <div className="w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-xl shadow-red-200">
      <h1 className="text-center text-2xl font-bold text-red-800">新規登録</h1>
      <p className="mt-2 text-center text-sm text-red-900/70">
        Ketchup アカウントを作成して、ポモドーロとタスク管理をはじめましょう。
      </p>

      <form className="mt-6 space-y-4" method="POST" action={formAction}>
        {state.success === false && state.errors._form && (
          <p className="mt-3 text-center text-sm text-red-500">
            {state.errors._form[0]}
          </p>
        )}
        {/* 名前（ニックネーム） */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-red-900"
          >
            名前（ニックネーム）
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="nickname"
            required
            className="mt-1 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-950 shadow-sm outline-none ring-red-400/70 placeholder:text-red-300 focus:border-red-400 focus:ring-2"
            placeholder="例）けちゃ太郎"
          />
          {state.success === false && state.errors.name && (
            <p className="text-red-500 text-sm">{state.errors.name[0]}</p>
          )}
        </div>

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
            autoComplete="new-password"
            required
            className="mt-1 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-950 shadow-sm outline-none ring-red-400/70 placeholder:text-red-300 focus:border-red-400 focus:ring-2"
            placeholder="8文字以上のパスワード"
          />
          {state.success === false && state.errors.password && (
            <p className="text-red-500 text-sm">{state.errors.password[0]}</p>
          )}
        </div>

        {/* 登録ボタン */}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-700/40 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? "登録中..." : "登録する"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-red-900/70">
        すでにアカウントをお持ちの方は{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-red-700 underline-offset-2 hover:underline"
        >
          ログイン
        </Link>
        してください。
      </p>
    </div>
  );
}
