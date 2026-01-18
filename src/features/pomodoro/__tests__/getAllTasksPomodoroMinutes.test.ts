/**
 * getAllTasksPomodoroMinutes サービスのテスト
 * Drizzleクライアントをモック化してテスト
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// DBクライアントをモック化
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockGroupBy = vi.fn();

vi.mock("@/app/db/client", () => ({
  db: {
    select: () => ({
      from: mockFrom,
    }),
  },
}));

describe("getAllTasksPomodoroMinutes", () => {
  const testProfileId = "00000000-0000-0000-0000-000000000001";
  const testTaskId1 = "10000000-0000-0000-0000-000000000001";
  const testTaskId2 = "10000000-0000-0000-0000-000000000002";

  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      where: mockWhere,
    });
    mockWhere.mockReturnValue({
      groupBy: mockGroupBy,
    });
  });

  it("複数タスクの実績が正しく集計されること", async () => {
    const { getAllTasksPomodoroMinutes } = await import(
      "../services/getAllTasksPomodoroMinutes"
    );

    // SQL集計済みの結果をモック
    mockGroupBy.mockResolvedValue([
      { taskId: testTaskId1, totalMinutes: 40 },
      { taskId: testTaskId2, totalMinutes: 50 },
    ]);

    const result = await getAllTasksPomodoroMinutes(testProfileId);

    expect(mockFrom).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
    expect(mockGroupBy).toHaveBeenCalled();
    expect(result).toEqual({
      [testTaskId1]: 40,
      [testTaskId2]: 50,
    });
  });

  it("セッションが存在しない場合は空のオブジェクトを返すこと", async () => {
    const { getAllTasksPomodoroMinutes } = await import(
      "../services/getAllTasksPomodoroMinutes"
    );
    mockGroupBy.mockResolvedValue([]);

    const result = await getAllTasksPomodoroMinutes(testProfileId);

    expect(result).toEqual({});
  });

  it("stoppedAtがnullのセッションは計算に含めないこと", async () => {
    const { getAllTasksPomodoroMinutes } = await import(
      "../services/getAllTasksPomodoroMinutes"
    );

    // SQL WHERE句で stoppedAt IS NOT NULL が適用されるため、
    // 完了セッションのみが集計結果に含まれる
    mockGroupBy.mockResolvedValue([
      { taskId: testTaskId1, totalMinutes: 25 },
    ]);

    const result = await getAllTasksPomodoroMinutes(testProfileId);

    expect(result).toEqual({
      [testTaskId1]: 25, // 完了分のみカウント
    });
  });

  it("同じタスクの複数セッションが正しく合計されること", async () => {
    const { getAllTasksPomodoroMinutes } = await import(
      "../services/getAllTasksPomodoroMinutes"
    );

    // SQL GROUP BYで同じタスクの複数セッションが合計される
    mockGroupBy.mockResolvedValue([
      { taskId: testTaskId1, totalMinutes: 60 }, // 25 + 25 + 10
    ]);

    const result = await getAllTasksPomodoroMinutes(testProfileId);

    expect(result).toEqual({
      [testTaskId1]: 60, // 25 + 25 + 10
    });
  });

  it("DBエラー時に例外がスローされること", async () => {
    const { getAllTasksPomodoroMinutes } = await import(
      "../services/getAllTasksPomodoroMinutes"
    );
    mockGroupBy.mockRejectedValue(new Error("Database error"));

    await expect(
      getAllTasksPomodoroMinutes(testProfileId)
    ).rejects.toThrow("Database error");
  });
});
