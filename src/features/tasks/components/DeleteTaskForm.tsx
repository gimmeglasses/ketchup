"use client";

import { useState } from "react";
import { deleteTaskAction } from "@/features/tasks/actions/deleteTaskAction";
import { Task } from "@/features/tasks/types";
import { FormButton } from "@/features/tasks/components/FormButton";
import { TiDelete } from "react-icons/ti";

interface DeleteTaskFormProps {
  onSuccess: (type: "update" | "delete") => void;
  onClose: () => void;
  task: Task;
}

export const DeleteTaskForm = ({
  onSuccess,
  onClose,
  task,
}: DeleteTaskFormProps) => {
  const [pendingDelete, setPendingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const handleDelete = async () => {
    setPendingDelete(true);
    try {
      const result = await deleteTaskAction(task.id);
      if (result.success) {
        onSuccess("delete");
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
    <div className="relative w-full max-w-md rounded-2xl bg-white p-8 ">
      <div className="flex items-center justify-center gap-2">
        <TiDelete size={40} className="text-red-700 font-bold" />
      </div>
      <div className="mt-3 text-center">
        <p className="font-semibold text-gray-900">
          「{task.title}」を削除します。
        </p>
        <p className="mt-2 text-sm text-gray-900/70">
          この操作は取り消せません。
        </p>
      </div>
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

      <div className="mt-5 flex gap-6 justify-center">
        <div className="w-32">
          <FormButton
            disabled={pendingDelete}
            type="button"
            onClick={onClose}
            variant="gray"
          >
            キャンセル
          </FormButton>
        </div>
        <div className="w-32">
          <FormButton
            disabled={pendingDelete}
            type="button"
            onClick={handleDelete}
            variant="red"
          >
            {pendingDelete ? "削除しています..." : "削除"}
          </FormButton>
        </div>
      </div>
    </div>
  );
};
