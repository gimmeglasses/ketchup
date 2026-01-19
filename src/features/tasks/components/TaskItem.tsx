"use client";

import type { Task } from "@/features/tasks/types";
import { dayjs } from "@/lib/dayjs";

type TaskItemProps = {
  task: Task;
};

export function TaskItem({ task }: TaskItemProps) {
  const isCompleted = !!task.completedAt;
  const isOverdue =
    task.dueAt && !isCompleted && dayjs(task.dueAt).isBefore(dayjs());

  return (
    <div
      className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
        isCompleted ? "opacity-60" : ""
      } ${isOverdue ? "border-red-300 bg-red-50" : "border-gray-200"}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* タイトル */}
          <h3
            className={`text-lg font-medium ${
              isCompleted ? "line-through text-gray-500" : "text-gray-900"
            }`}
          >
            {task.title}
          </h3>

          {/* 説明 */}
          {task.note && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {task.note}
            </p>
          )}

          {/* メタ情報 */}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
            {task.dueAt && (
              <span
                className={`flex items-center gap-1 ${
                  isOverdue ? "text-red-600 font-medium" : ""
                }`}
              >
                📅 期限: {dayjs(task.dueAt).format("YYYY/MM/DD")}
                {isOverdue && " (超過)"}
              </span>
            )}

            {task.estimatedMinutes && (
              <span className="flex items-center gap-1">
                ⏱️ 見積: {task.estimatedMinutes}分
              </span>
            )}

            <span className="flex items-center gap-1">
              📝 作成: {dayjs(task.createdAt).format("YYYY/MM/DD HH:mm")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
