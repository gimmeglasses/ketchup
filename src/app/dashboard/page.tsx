import { Metadata } from "next";
import { getTasks } from "@/lib/mockData"
import DashboardContainer from "@/features/dashboard/components/DashboardContainer"

export const metadata: Metadata = {
  title: "ダッシュボード",
  description: "タスク一覧を表示します。",
};

const DashboardHome = async () => {

  // ASIS: get mock data
  // TOBE: get from server actions (後でバックエンドと連携)
  const tasks = await getTasks();
  // Currently used "Tasks" info in Dashboard
  //  - id: "ID0000000001TASK",
  //  - name: "企画書を作成する",
  //  - dueDate: "2026-01-10",
  //  - estimatedMin: 60,
  //  - completedAt: null,

  // 未完了タスクを抽出
  const incompleteTasks = tasks.filter((task) => task.completedAt === null);

  return (
    <main className="min-h-screen w-full max-w-4xl mx-auto p-4 md:p-8">
      <DashboardContainer incompleteTasks={incompleteTasks}/>
    </main>
  );
};
export default DashboardHome;