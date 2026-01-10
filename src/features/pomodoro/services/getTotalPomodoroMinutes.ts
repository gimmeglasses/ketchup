import { db } from "@/app/db/client";
import { pomodoroSessions } from "@/app/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";

/**
 * 指定されたタスクの完了したポモドーロセッションの総実績時間（分）を計算します。
 *
 * @param profileId ユーザーID
 * @param taskId タスクID
 * @returns 総実績時間（分）
 */
export async function getTotalPomodoroMinutes(
  profileId: string,
  taskId: string
): Promise<number> {
  const sessions = await db
    .select()
    .from(pomodoroSessions)
    .where(
      and(
        eq(pomodoroSessions.profileId, profileId),
        eq(pomodoroSessions.taskId, taskId),
        isNotNull(pomodoroSessions.stoppedAt)
      )
    );

  if (sessions.length === 0) {
    return 0;
  }

  const totalMinutes = sessions.reduce((total, session) => {
    if (!session.stoppedAt) {
      return total;
    }

    const startedAt = new Date(session.startedAt);
    const stoppedAt = new Date(session.stoppedAt);
    const durationMs = stoppedAt.getTime() - startedAt.getTime();
    const durationMinutes = Math.floor(durationMs / 1000 / 60);

    return total + durationMinutes;
  }, 0);

  return totalMinutes;
}
