"use client";

import { useState, useActionState, useEffect } from "react";
import {
  updateTaskAction,
  type UpdateTaskActionResult,
} from "@/features/tasks/actions/updateTaskAction";
import { deleteTaskAction } from "@/features/tasks/actions/deleteTaskAction";
import { Task } from "@/features/tasks/types";
import { FormButton } from "@/features/tasks/components/FormButton";
import { RiDeleteBin5Line } from "react-icons/ri";

const initialUpdateState: UpdateTaskActionResult = {
  success: false,
  errors: {},
};

interface EditTaskFormProps {
  onSuccess: () => void;
  onClose: () => void;
  task: Task;
}

export const EditTaskForm = ({
  onSuccess,
  onClose,
  task,
}: EditTaskFormProps) => {
  const [state, formAction, pending] = useActionState<
    UpdateTaskActionResult,
    FormData
  >(updateTaskAction, initialUpdateState);

  useEffect(() => {
    if (state.success) {
      onSuccess();
    } else {
    }
  }, [state, onSuccess]);

  const [pendingDelete, setPendingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const handleDelete = async () => {
    setPendingDelete(true);
    try {
      const result = await deleteTaskAction(task.id);
      if (result.success) {
        onSuccess();
      } else {
        setDeleteError(result.errors?._form?.[0] || "削除に失敗しました。");
      }
    } catch {
      setDeleteError("通信エラーが発生しました。");
    } finally {
      setPendingDelete(false);
    }
  };

  return (
    <div className="relative w-full max-w-md rounded-2xl bg-white/90 p-6 ">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-2xl text-teal-400 transition-colors hover:bg-teal-50 hover:text-teal-600"
        aria-label="閉じる"
      >
        ×
      </button>
      <h1 className="text-center text-2xl font-bold text-teal-800">
        タスク編集
      </h1>
      <p className="mt-2 text-center text-sm text-teal-900/70">
        新しいタスクを入力してください
      </p>
      <form className="mt-6 space-y-4" action={formAction}>
        <input type="hidden" name="id" value={task.id} />

        {state.success === false && state.errors._form && (
          <p className="mt-3 text-center text-sm text-red-500">
            {state.errors._form[0]}
          </p>
        )}

        {/* エラーメッセージの表示 */}
        {deleteError && (
          <div
            className="mt-4 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center"
            role="alert"
          >
            <span>{deleteError}</span>
            <button
              onClick={() => setDeleteError(null)}
              className="text-red-500 hover:text-red-700 font-bold px-2"
              aria-label="エラーメッセージを閉じる"
            >
              ×
            </button>
          </div>
        )}

        {/* タスク名 */}
        <div>
          <div className="flex gap-1">
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-teal-900"
            >
              タスク名
            </label>
            <span className="px-1 py-0.5 rounded text-xs bg-teal-600 text-teal-100">
              必須
            </span>
          </div>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={task.title}
            required
            className="mt-1 w-full rounded-xl border border-teal-200 bg-white px-3 py-2 text-sm text-red-950 shadow-sm outline-none ring-teal-400/70 placeholder:text-teal-300 focus:border-teal-400 focus:ring-2"
            placeholder="次にやる行動は？"
          />
          {state.success === false && state.errors.title && (
            <p className="text-red-500 text-sm">{state.errors.title[0]}</p>
          )}
        </div>

        {/* タスクの説明 */}
        <div>
          <label
            htmlFor="note"
            className="block text-sm font-semibold text-teal-900"
          >
            タスクの説明
          </label>
          <textarea
            id="note"
            name="note"
            defaultValue={task.note ?? undefined}
            className="mt-1 w-full rounded-xl border border-teal-200 bg-white px-3 py-2 text-sm text-red-950 shadow-sm outline-none ring-teal-400/70 placeholder:text-teal-300 focus:border-teal-400 focus:ring-2"
            placeholder="いつ・どこで・何を？"
          />
          {state.success === false && state.errors.note && (
            <p className="text-red-500 text-sm">{state.errors.note[0]}</p>
          )}
        </div>

        {/* 期限 */}
        <div>
          <label
            htmlFor="dueAt"
            className="block text-sm font-semibold text-teal-900"
          >
            期限
          </label>
          <input
            id="dueAt"
            name="dueAt"
            type="date"
            defaultValue={task.dueAt ?? undefined}
            className="mt-1 w-full rounded-xl border border-teal-200 bg-white px-3 py-2 text-sm text-red-950 shadow-sm outline-none ring-teal-400/70 placeholder:text-teal-300 focus:border-teal-400 focus:ring-2"
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
            className="block text-sm font-semibold text-teal-900"
          >
            予定（分）
          </label>
          <input
            id="estimatedMinutes"
            name="estimatedMinutes"
            type="number"
            defaultValue={task.estimatedMinutes ?? undefined}
            min="1"
            step="1"
            className="mt-1 w-full rounded-xl border border-teal-200 bg-white px-3 py-2 text-sm text-red-950 shadow-sm outline-none ring-teal-400/70 placeholder:text-teal-300 focus:border-teal-400 focus:ring-2"
            placeholder=""
          />
          {state.success === false && state.errors.estimatedMinutes && (
            <p className="text-red-500 text-sm">
              {state.errors.estimatedMinutes[0]}
            </p>
          )}
        </div>
        <div className="flex gap-3 pt-2 justify-center">
          {/* 更新ボタン - ティール系 */}
          <FormButton disabled={pending} type="submit" variant="teal">
            {pending ? "更新中..." : "更新する"}
          </FormButton>

          {/* 削除ボタン - ティール系 */}
          <FormButton
            disabled={pendingDelete}
            type="button"
            onClick={handleDelete}
            variant="teal"
          >
            <RiDeleteBin5Line size={25} />
            {pendingDelete ? "削除中..." : "削除する"}
          </FormButton>
        </div>
      </form>
    </div>
  );
};
