"use client";

import { useEffect, useState } from "react";
import { listTasksAction } from "@/features/tasks/actions/listTasksAction";
import { getAllTasksPomodoroMinutesAction } from "@/features/pomodoro/actions/getAllTasksPomodoroMinutesAction";
import { TaskListFilter } from "./TaskListFilter";
import { TaskItem } from "./TaskItem";
import type {
  Task,
  TaskStatusFilter,
  TaskDueFilter,
  TaskSortBy,
  SortOrder,
} from "@/features/tasks/types";
import { TaskListSkeleton } from "@/app/(app)/tasks/TaskListSkeleton";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pomodoroMinutes, setPomodoroMinutes] = useState<
    Record<string, number>
  >({});

  // フィルター・ソート状態
  const [status, setStatus] = useState<TaskStatusFilter | undefined>();
  const [due, setDue] = useState<TaskDueFilter>("all");
  const [sortBy, setSortBy] = useState<TaskSortBy>("dueAt");
  const [order, setOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const [result, minutes] = await Promise.all([
          listTasksAction({
            status,
            due: due === "all" ? undefined : due,
            sortBy,
            order,
          }),
          getAllTasksPomodoroMinutesAction().catch(() => ({})),
        ]);
        setTasks(result);
        setPomodoroMinutes(minutes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [status, due, sortBy, order]);

  if (loading) {
    return <TaskListSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TaskListFilter
        status={status}
        due={due}
        sortBy={sortBy}
        order={order}
        onStatusChange={setStatus}
        onDueChange={setDue}
        onSortByChange={setSortBy}
        onOrderChange={setOrder}
      />

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          タスクが見つかりませんでした
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              actualMinutes={pomodoroMinutes[task.id] ?? 0}
            />
          ))}
        </div>
      )}

      <div className="text-sm text-gray-500 text-center">
        {tasks.length} 件のタスク
      </div>
    </div>
  );
}
