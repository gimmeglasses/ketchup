"use client";

import type { Task } from "@/features/tasks/types";
import { dayjs } from "@/lib/dayjs";

type TaskItemProps = {
  task: Task;
  actualMinutes?: number;
};

export function TaskItem({ task, actualMinutes = 0 }: TaskItemProps) {
  const isCompleted = !!task.completedAt;
  const isOverdue =
    task.dueAt && !isCompleted && dayjs(task.dueAt).isBefore(dayjs());
  const progress = task.estimatedMinutes
    ? Math.round((actualMinutes / task.estimatedMinutes) * 100)
    : 0;
  const isProgressComplete = progress >= 100;

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

          {/* 実績セクション */}
          {actualMinutes > 0 && (
            <div className="mt-4 space-y-2">
              {task.estimatedMinutes ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      実績: {actualMinutes}分 / {task.estimatedMinutes}分
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        isProgressComplete
                          ? "text-green-600"
                          : progress >= 75
                            ? "text-blue-600"
                            : progress >= 50
                              ? "text-orange-600"
                              : "text-gray-600"
                      }`}
                    >
                      {progress}%
                    </span>
                  </div>
                  {/* プログレスバー */}
                  <div
                    className="w-full bg-gray-200 rounded-full h-2"
                    role="progressbar"
                    aria-valuenow={Math.min(progress, 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`タスク進捗: ${actualMinutes}分 / ${task.estimatedMinutes}分 (${progress}%)`}
                  >
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isProgressComplete
                          ? "bg-green-500"
                          : progress >= 75
                            ? "bg-blue-500"
                            : progress >= 50
                              ? "bg-orange-500"
                              : "bg-gray-400"
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </>
              ) : (
                <span className="text-sm font-medium text-gray-700">
                  実績: {actualMinutes}分
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
