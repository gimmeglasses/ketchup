import { and, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/app/db/client";
import { pomodoroSessions } from "@/app/db/schema";

const SECONDS_PER_MINUTE = 60;

/**
 * 指定されたユーザーの全タスクの完了したポモドーロセッション実績時間を取得します。
 * N+1問題を回避するため、1回のクエリで全タスクの実績を集計します。
 *
 * @param profileId ユーザーID
 * @returns タスクIDをキー、実績時間（分）を値とするRecord
 */
export async function getAllTasksPomodoroMinutes(
  profileId: string
): Promise<Record<string, number>> {
  const results = await db
    .select({
      taskId: pomodoroSessions.taskId,
      totalMinutes: sql<number>`FLOOR(SUM(EXTRACT(EPOCH FROM (${pomodoroSessions.stoppedAt} - ${pomodoroSessions.startedAt})) / ${SECONDS_PER_MINUTE}))`,
    })
    .from(pomodoroSessions)
    .where(
      and(
        eq(pomodoroSessions.profileId, profileId),
        isNotNull(pomodoroSessions.stoppedAt)
      )
    )
    .groupBy(pomodoroSessions.taskId);

  return Object.fromEntries(
    results.map((r) => [r.taskId, Number(r.totalMinutes)])
  );
}
