import type { tasks } from "@/app/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type Task = InferSelectModel<typeof tasks>;
export type TaskStatusFilter = "todo" | "done";

export type TaskDueFilter =
  | "all"
  | "withDue"
  | "withoutDue"
  | "today"
  | "overdue";

export type TaskSortBy = "createdAt" | "dueAt" | "estimatedMinutes";

export type SortOrder = "asc" | "desc";

export type ListTasksParams = {
  status?: TaskStatusFilter;
  due?: TaskDueFilter;
  sortBy?: TaskSortBy;
  order?: SortOrder;
};