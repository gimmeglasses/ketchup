import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/app/db/client";
import { pomodoroSessions } from "@/app/db/schema";

const MS_PER_MINUTE = 60 * 1000;

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

  return sessions.reduce((total, session) => {
    const startedAt = new Date(session.startedAt);
    const stoppedAt = new Date(session.stoppedAt);
    const durationMinutes = Math.floor(
      (stoppedAt.getTime() - startedAt.getTime()) / MS_PER_MINUTE
    );

    return total + durationMinutes;
  }, 0);
}
