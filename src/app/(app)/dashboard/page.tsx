import { Metadata } from "next";
// import { getTasks } from "@/lib/mockData";
import { listTasksAction } from "@/features/tasks/actions/listTasksAction";
import DashboardContainer from "@/features/dashboard/components/DashboardContainer";

export const metadata: Metadata = {
  title: "ダッシュボード",
  description: "タスク一覧を表示します。",
};

const DashboardHome = async () => {
  // ASIS: get mock data
  // TOBE: get from server actions (後でバックエンドと連携)
  const tasks = await listTasksAction();
  // Currently used "Tasks" fields in Dashboard
  //  - id: string (一意なタスクID)
  //  - name: string (タスク名/タイトル)
  //  - dueDate: string (期限日を表す日付文字列)
  //  - estimatedMin: number (想定所要時間[分])
  //  - completedAt: Date | null (完了日時。未完了の場合は null)

  // 未完了タスクを抽出
  // const incompleteTasks = tasks.filter((task) => task.completedAt === null);

  return (
    <main className="min-h-screen w-full max-w-4xl mx-auto p-4 md:p-8">
      <DashboardContainer tasks={tasks} />
    </main>
  );
};
export default DashboardHome;
