"use client";

import { useActionState } from "react";
import {
  updatePasswordAction,
  type UpdatePasswordActionResult,
} from "@/features/auth/actions/updatePasswordAction";

const initialState: UpdatePasswordActionResult = {
  success: false,
  errors: {},
};

export function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState<
    UpdatePasswordActionResult,
    FormData
  >(updatePasswordAction, initialState);

  return (
    <div className="w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-xl shadow-red-200">
      <h1 className="text-center text-2xl font-bold text-red-800">
        パスワードの更新
      </h1>
      <p className="mt-2 text-center text-sm text-red-900/70">
        新しいパスワードを入力してください。
      </p>

      <form className="mt-6 space-y-4" action={formAction}>
        {/* フォーム共通エラー */}
        {state.success === false && state.errors._form && (
          <p className="text-center text-sm text-red-500">
            {state.errors._form[0]}
          </p>
        )}

        {/* パスワード */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-red-900"
          >
            新しいパスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-950 shadow-sm outline-none ring-red-400/70 placeholder:text-red-300 focus:border-red-400 focus:ring-2"
            placeholder="8文字以上で入力"
          />
          {state.success === false && state.errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {state.errors.password[0]}
            </p>
          )}
        </div>

        {/* パスワード確認 */}
        <div>
          <label
            htmlFor="passwordConfirmation"
            className="block text-sm font-semibold text-red-900"
          >
            パスワード（確認）
          </label>
          <input
            id="passwordConfirmation"
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-950 shadow-sm outline-none ring-red-400/70 placeholder:text-red-300 focus:border-red-400 focus:ring-2"
            placeholder="もう一度入力"
          />
          {state.success === false && state.errors.passwordConfirmation && (
            <p className="mt-1 text-sm text-red-500">
              {state.errors.passwordConfirmation[0]}
            </p>
          )}
        </div>

        {/* 更新ボタン */}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-700/40 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? "更新中..." : "パスワードを更新"}
        </button>
      </form>
    </div>
  );
}
