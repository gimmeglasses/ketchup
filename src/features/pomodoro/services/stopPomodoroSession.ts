import { and, eq } from "drizzle-orm";
import { db } from "@/app/db/client";
import { pomodoroSessions } from "@/app/db/schema";
import { type PomodoroSession } from "@/features/pomodoro/types";

/**
 * ポモドーロセッションを停止します。
 *
 * @param sessionId セッションID
 * @param profileId ユーザーID
 * @returns 停止されたセッション
 */
export async function stopPomodoroSession(
  sessionId: string,
  profileId: string
): Promise<PomodoroSession> {
  const [stopped] = await db
    .update(pomodoroSessions)
    .set({
      stoppedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(pomodoroSessions.id, sessionId),
        eq(pomodoroSessions.profileId, profileId)
      )
    )
    .returning();

  if (!stopped) {
    throw new Error("Failed to stop pomodoro session");
  }

  return stopped;
}
