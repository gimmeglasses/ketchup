import { TaskList } from "@/features/tasks/components/TaskList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "タスク一覧",
  description: "タスク一覧を表示します。",
};

export default function TasksPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <TaskList />
    </div>
  );
}
