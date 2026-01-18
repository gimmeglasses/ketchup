"use client";

import type {
  TaskStatusFilter,
  TaskDueFilter,
  TaskSortBy,
  SortOrder,
} from "@/features/tasks/types";

type TaskListFilterProps = {
  status?: TaskStatusFilter;
  due: TaskDueFilter;
  sortBy: TaskSortBy;
  order: SortOrder;
  onStatusChange: (status?: TaskStatusFilter) => void;
  onDueChange: (due: TaskDueFilter) => void;
  onSortByChange: (sortBy: TaskSortBy) => void;
  onOrderChange: (order: SortOrder) => void;
};

export function TaskListFilter({
  status,
  due,
  sortBy,
  order,
  onStatusChange,
  onDueChange,
  onSortByChange,
  onOrderChange,
}: TaskListFilterProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ステータスフィルター */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ステータス
          </label>
          <select
            value={status ?? "all"}
            onChange={(e) =>
              onStatusChange(
                e.target.value === "all"
                  ? undefined
                  : (e.target.value as TaskStatusFilter),
              )
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="todo">未完了</option>
            <option value="done">完了</option>
          </select>
        </div>

        {/* 期限フィルター */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            期限
          </label>
          <select
            value={due}
            onChange={(e) => onDueChange(e.target.value as TaskDueFilter)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="withDue">期限あり</option>
            <option value="withoutDue">期限なし</option>
            <option value="today">今日まで</option>
            <option value="overdue">期限超過</option>
          </select>
        </div>

        {/* ソート基準 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            並び順
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as TaskSortBy)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="dueAt">期限</option>
            <option value="createdAt">作成日時</option>
            <option value="estimatedMinutes">見積時間</option>
          </select>
        </div>

        {/* ソート順序 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            順序
          </label>
          <select
            value={order}
            onChange={(e) => onOrderChange(e.target.value as SortOrder)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="asc">昇順</option>
            <option value="desc">降順</option>
          </select>
        </div>
      </div>
    </div>
  );
}
