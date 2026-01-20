import { Metadata } from "next";
import { listTasksAction } from "@/features/tasks/actions/listTasksAction";
import { getAllTasksPomodoroMinutesAction } from "@/features/pomodoro/actions/getAllTasksPomodoroMinutesAction";
import DashboardContainer from "@/features/dashboard/components/DashboardContainer";

export const metadata: Metadata = {
  title: "ダッシュボード",
  description: "タスク一覧を表示します。",
};

const DashboardHome = async () => {
  // 未完了タスクのみ取得
  const status = "todo";
  const [tasks, pomodoroMinutes] = await Promise.all([
    listTasksAction({ status }),
    getAllTasksPomodoroMinutesAction().catch((error) => {
      console.error("Failed to load pomodoro minutes:", error);
      return {} as Record<string, number>;
    }),
  ]);

  return (
    <main className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <DashboardContainer tasks={tasks} pomodoroMinutes={pomodoroMinutes} />
    </main>
  );
};
export default DashboardHome;
