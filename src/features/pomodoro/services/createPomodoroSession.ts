import { db } from "@/app/db/client";
import { pomodoroSessions } from "@/app/db/schema";
import { type PomodoroSession } from "@/features/pomodoro/types";

/**
 * 新しいポモドーロセッションを作成します。
 *
 * @param profileId ユーザーID
 * @param taskId タスクID
 * @returns 作成されたセッション
 */
export async function createPomodoroSession(
  profileId: string,
  taskId: string
): Promise<PomodoroSession> {
  const [created] = await db
    .insert(pomodoroSessions)
    .values({
      profileId,
      taskId,
      startedAt: new Date().toISOString(),
      stoppedAt: null,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create pomodoro session");
  }

  return created;
}
