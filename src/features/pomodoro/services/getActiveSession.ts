import { db } from "@/app/db/client";
import { pomodoroSessions } from "@/app/db/schema";
import { type PomodoroSession } from "@/features/pomodoro/types";
import { and, eq, isNull } from "drizzle-orm";

/**
 * 指定されたタスクの未完了セッションを取得します。
 *
 * @param profileId ユーザーID
 * @param taskId タスクID
 * @returns 未完了セッション（存在しない場合はnull）
 */
export async function getActiveSession(
  profileId: string,
  taskId: string
): Promise<PomodoroSession | null> {
  const [session] = await db
    .select()
    .from(pomodoroSessions)
    .where(
      and(
        eq(pomodoroSessions.profileId, profileId),
        eq(pomodoroSessions.taskId, taskId),
        isNull(pomodoroSessions.stoppedAt)
      )
    );

  return session || null;
}
