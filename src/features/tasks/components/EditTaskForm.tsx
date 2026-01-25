"use client";

import { useState, useActionState, useEffect } from "react";
import {
  updateTaskAction,
  type UpdateTaskActionResult,
} from "@/features/tasks/actions/updateTaskAction";
import { Task } from "@/features/tasks/types";
import { FormButton } from "@/features/tasks/components/FormButton";
import { dayjs } from "@/lib/dayjs";
import { RiDeleteBin5Line } from "react-icons/ri";
import { ModalContainer } from "@/features/tasks/components/ModalContainer";
import { DeleteTaskForm } from "@/features/tasks/components/DeleteTaskForm";

const initialUpdateState: UpdateTaskActionResult = {
  success: false,
  errors: {},
};

interface EditTaskFormProps {
  onSuccess: (
    type: "update" | "delete",
    taskId?: string,
    taskTitle?: string,
  ) => void;
  onClose: () => void;
  task: Task;
}

export const EditTaskForm = ({
  onSuccess,
  onClose,
  task,
}: EditTaskFormProps) => {
  const formatDueDate = (dueAt: string | null): string => {
    if (!dueAt) return "-";
    return dayjs(dueAt).format("YYYY-MM-DD");
  };
  const [state, formAction, pending] = useActionState<
    UpdateTaskActionResult,
    FormData
  >(updateTaskAction, initialUpdateState);
  const taskId = task.id;
  useEffect(() => {
    if (state.success) {
      onSuccess("update", taskId);
    }
  }, [state.success, onSuccess, taskId]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // 編集フォーム内での削除ボタンは確認モーダルを開くだけにする
  const openDeleteConfirm = () => {
    setIsModalOpen(true);
  };

  // モーダルを閉じる処理
  const handleClose = () => {
    setIsModalOpen(false);
  };

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
        タスク編集
      </h1>
      <p className="mt-2 text-center text-sm text-red-900/70">
        タスク情報を編集してください
      </p>
      <form className="mt-6 space-y-4" action={formAction}>
        <input type="hidden" name="id" value={task.id} />

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
            <span className="px-1 py-0.5 rounded text-xs bg-red-600 text-red-100">
              必須
            </span>
          </div>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={task.title}
            required
            className="mt-1 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-950 shadow-sm outline-none ring-red-400/70 placeholder:text-red-300 focus:border-red-400 focus:ring-2"
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
            className="block text-sm font-semibold text-red-900"
          >
            📝 タスクの説明
          </label>
          <textarea
            id="note"
            name="note"
            defaultValue={task.note ?? undefined}
            className="mt-1 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-950 shadow-sm outline-none ring-red-400/70 placeholder:text-red-300 focus:border-red-400 focus:ring-2"
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
            className="block text-sm font-semibold text-red-900"
          >
            📅 期限
          </label>
          <input
            id="dueAt"
            name="dueAt"
            type="date"
            defaultValue={formatDueDate(task.dueAt)}
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
            ⏱️ 予定（分）
          </label>
          <input
            id="estimatedMinutes"
            name="estimatedMinutes"
            type="number"
            defaultValue={task.estimatedMinutes ?? undefined}
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
        <div className="mt-10 flex gap-6 justify-center">
          <div className="w-32">
            {/* 更新ボタン */}
            <FormButton disabled={pending} type="submit" variant="red">
              {pending ? "更新中..." : "更新する"}
            </FormButton>
          </div>
          <div className="w-32">
            {/* 削除ボタン */}
            <FormButton type="button" onClick={openDeleteConfirm} variant="red">
              <RiDeleteBin5Line size={25} />
              削除する
            </FormButton>
          </div>
        </div>
      </form>
      {isModalOpen && task && (
        <ModalContainer isOpen={isModalOpen} onClose={handleClose}>
          <DeleteTaskForm
            onSuccess={onSuccess}
            onClose={handleClose}
            task={task}
          />
        </ModalContainer>
      )}
    </div>
  );
};
