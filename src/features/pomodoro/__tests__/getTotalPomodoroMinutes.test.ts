/**
 * getTotalPomodoroMinutes サービスのテスト
 * Drizzleクライアントをモック化してテスト
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// DBクライアントをモック化
const mockFrom = vi.fn();
const mockWhere = vi.fn();

vi.mock("@/app/db/client", () => ({
  db: {
    select: () => ({
      from: mockFrom,
    }),
  },
}));

describe("getTotalPomodoroMinutes", () => {
  const testProfileId = "00000000-0000-0000-0000-000000000001";
  const testTaskId = "10000000-0000-0000-0000-000000000001";

  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      where: mockWhere,
    });
  });

  it("完了したセッションの総実績時間を正しく計算できること", async () => {
    const { getTotalPomodoroMinutes } = await import(
      "../services/getTotalPomodoroMinutes"
    );

    // 25分のセッション
    const session1 = {
      id: "20000000-0000-0000-0000-000000000001",
      taskId: testTaskId,
      profileId: testProfileId,
      startedAt: "2030-01-01T00:00:00.000Z",
      stoppedAt: "2030-01-01T00:25:00.000Z",
      createdAt: "2030-01-01T00:00:00.000Z",
    };

    // 15分のセッション
    const session2 = {
      id: "20000000-0000-0000-0000-000000000002",
      taskId: testTaskId,
      profileId: testProfileId,
      startedAt: "2030-01-01T01:00:00.000Z",
      stoppedAt: "2030-01-01T01:15:00.000Z",
      createdAt: "2030-01-01T01:00:00.000Z",
    };

    mockWhere.mockResolvedValue([session1, session2]);

    const result = await getTotalPomodoroMinutes(testProfileId, testTaskId);

    expect(mockFrom).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
    expect(result).toBe(40); // 25 + 15 = 40分
  });

  it("セッションが存在しない場合は0を返すこと", async () => {
    const { getTotalPomodoroMinutes } = await import(
      "../services/getTotalPomodoroMinutes"
    );
    mockWhere.mockResolvedValue([]);

    const result = await getTotalPomodoroMinutes(testProfileId, testTaskId);

    expect(result).toBe(0);
  });

  it("stoppedAtがnullのセッションは計算に含めないこと", async () => {
    const { getTotalPomodoroMinutes } = await import(
      "../services/getTotalPomodoroMinutes"
    );

    // 完了セッション（25分）
    const completedSession = {
      id: "20000000-0000-0000-0000-000000000001",
      taskId: testTaskId,
      profileId: testProfileId,
      startedAt: "2030-01-01T00:00:00.000Z",
      stoppedAt: "2030-01-01T00:25:00.000Z",
      createdAt: "2030-01-01T00:00:00.000Z",
    };

    // 未完了セッション（除外される）
    const activeSession = {
      id: "20000000-0000-0000-0000-000000000002",
      taskId: testTaskId,
      profileId: testProfileId,
      startedAt: "2030-01-01T01:00:00.000Z",
      stoppedAt: null,
      createdAt: "2030-01-01T01:00:00.000Z",
    };

    mockWhere.mockResolvedValue([completedSession, activeSession]);

    const result = await getTotalPomodoroMinutes(testProfileId, testTaskId);

    expect(result).toBe(25); // 完了分のみカウント
  });

  it("DBエラー時に例外がスローされること", async () => {
    const { getTotalPomodoroMinutes } = await import(
      "../services/getTotalPomodoroMinutes"
    );
    mockWhere.mockRejectedValue(new Error("Database error"));

    await expect(
      getTotalPomodoroMinutes(testProfileId, testTaskId)
    ).rejects.toThrow("Database error");
  });
});
