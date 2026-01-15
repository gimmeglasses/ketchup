"use client";

import { useActionState, useEffect } from "react";
import {
  createTaskAction,
  type CreateTaskActionResult,
} from "@/features/tasks/actions/createTaskAction";

const initialState: CreateTaskActionResult = {
  success: false,
  errors: {},
};

interface NewTaskFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const NewTaskForm = ({ onSuccess, onClose }: NewTaskFormProps) => {
  const [state, formAction, pending] = useActionState<
    CreateTaskActionResult,
    FormData
  >(createTaskAction, initialState);

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <div className="relative w-full max-w-md rounded-2xl bg-white/90 p-6 ">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-2xl text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
        aria-label="閉じる"
      >
        ×
      </button>
      <h1 className="text-center text-2xl font-bold text-red-800">
        タスク登録
      </h1>
      <p className="mt-2 text-center text-sm text-red-900/70">
        新しいタスクを入力してください
      </p>
      <form className="mt-6 space-y-4" action={formAction}>
        {state.success === false && state.errors._form && (
          <p className="mt-3 text-center text-sm text-red-500">
            {state.errors._form[0]}
          </p>
        )}

        {/* タスク名 */}
        <div>
          <div className="flex gap-1">
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-red-900"
            >
              タスク名
            </label>
            <label className="px-1 py-0.5 rounded text-xs bg-red-700 text-red-100">
              必須
            </label>
          </div>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="mt-1 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-950 shadow-sm outline-none ring-red-400/70 placeholder:text-red-300 focus:border-red-400 focus:ring-2"
            placeholder="例）最初の25分に集中する。"
          />
          {state.success === false && state.errors.title && (
            <p className="text-red-500 text-sm">{state.errors.title[0]}</p>
          )}
        </div>

        {/* タスクの説明 */}
        <div>
          <label
            htmlFor="note"
            className="block text-sm font-semibold text-red-900"
          >
            タスクの説明
          </label>
          <textarea
            id="note"
            name="note"
            className="mt-1 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-950 shadow-sm outline-none ring-red-400/70 placeholder:text-red-300 focus:border-red-400 focus:ring-2"
            placeholder="例）Ketchupのポモドーロタイマーで25分集中。終わったら5分休憩。まずは1セットやってみよう。"
          />
          {state.success === false && state.errors.note && (
            <p className="text-red-500 text-sm">{state.errors.note[0]}</p>
          )}
        </div>

        {/* 期限 */}
        <div>
          <label
            htmlFor="dueAt"
            className="block text-sm font-semibold text-red-900"
          >
            期限
          </label>
          <input
            id="dueAt"
            name="dueAt"
            type="date"
            className="mt-1 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-950 shadow-sm outline-none ring-red-400/70 placeholder:text-red-300 focus:border-red-400 focus:ring-2"
            placeholder="yyyy-mm-dd"
          />
          {state.success === false && state.errors.dueAt && (
            <p className="text-red-500 text-sm">{state.errors.dueAt[0]}</p>
          )}
        </div>

        {/* 見積もり */}
        <div>
          <label
            htmlFor="estimatedMinutes"
            className="block text-sm font-semibold text-red-900"
          >
            予定（分）
          </label>
          <input
            id="estimatedMinutes"
            name="estimatedMinutes"
            type="number"
            min="1"
            step="1"
            className="mt-1 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-950 shadow-sm outline-none ring-red-400/70 placeholder:text-red-300 focus:border-red-400 focus:ring-2"
            placeholder=""
          />
          {state.success === false && state.errors.estimatedMinutes && (
            <p className="text-red-500 text-sm">
              {state.errors.estimatedMinutes[0]}
            </p>
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
    </div>
  );
};
