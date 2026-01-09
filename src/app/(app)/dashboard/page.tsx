import { Metadata } from "next";
import { listTasksAction } from "@/features/tasks/actions/listTasksAction";
import DashboardContainer from "@/features/dashboard/components/DashboardContainer";

export const metadata: Metadata = {
  title: "ダッシュボード",
  description: "タスク一覧を表示します。",
};

const DashboardHome = async () => {
  const tasks = await listTasksAction();
  return (
    <main className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <DashboardContainer tasks={tasks} />
    </main>
  );
};
export default DashboardHome;
