"use client";

import { useEffect, useRef } from "react";

type ConfirmDialogProps = {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * 確認ダイアログコンポーネント
 * タイマー実行中のタスク切り替え時に表示される
 */
export function ConfirmDialog({
  open,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      }
    } else {
      if (typeof dialog.close === "function") {
        dialog.close();
      }
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="rounded-lg p-6 shadow-xl backdrop:bg-black/50"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <div className="space-y-4">
        <p className="text-gray-900">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            停止して切り替える
          </button>
        </div>
      </div>
    </dialog>
  );
}
