"use client";

import { useState, useActionState, useEffect } from "react";
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
}

export const NewTaskForm = ({ onSuccess }: NewTaskFormProps) => {
  const [date, setDate] = useState<string>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value);
    console.log(date);
  };

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
    <div className="w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-xl shadow-red-200">
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
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-red-900"
          >
            タスク名
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="mt-1 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-950 shadow-sm outline-none ring-red-400/70 placeholder:text-red-300 focus:border-red-400 focus:ring-2"
            placeholder="例）デイリースクラム"
          />
          {state.success === false && state.errors.name && (
            <p className="text-red-500 text-sm">{state.errors.name[0]}</p>
          )}
        </div>

        {/* タスクの説明 */}
        <div>
          <label
            htmlFor="text"
            className="block text-sm font-semibold text-red-900"
          >
            タスクの説明
          </label>
          <input
            id="note"
            name="note"
            type="textarea"
            required
            className="mt-1 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-950 shadow-sm outline-none ring-red-400/70 placeholder:text-red-300 focus:border-red-400 focus:ring-2"
            placeholder="例）コラボレイティブ特論スプリントイベント"
          />
          {state.success === false && state.errors.description && (
            <p className="text-red-500 text-sm">
              {state.errors.description[0]}
            </p>
          )}
        </div>

        {/* 期限 */}
        <div>
          <label
            htmlFor="dueDate"
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
            value={date}
            onChange={handleChange}
          />
          {state.success === false && state.errors.dueDate && (
            <p className="text-red-500 text-sm">{state.errors.dueDate[0]}</p>
          )}
        </div>

        {/* 見積もり */}
        <div>
          <label
            htmlFor="estimatedMin"
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
          {state.success === false && state.errors.estimatedMin && (
            <p className="text-red-500 text-sm">
              {state.errors.estimatedMin[0]}
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
