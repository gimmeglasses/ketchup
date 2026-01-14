/**
 * stopPomodoroSession サービスのテスト
 * Drizzleクライアントをモック化してテスト
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// DBクライアントをモック化
const mockSet = vi.fn();
const mockWhere = vi.fn();
const mockReturning = vi.fn();

vi.mock("@/app/db/client", () => ({
  db: {
    update: () => ({
      set: mockSet,
    }),
  },
}));

describe("stopPomodoroSession", () => {
  const testSessionId = "20000000-0000-0000-0000-000000000001";
  const testTaskId = "10000000-0000-0000-0000-000000000001";
  const testProfileId = "00000000-0000-0000-0000-000000000001";
  const mockStoppedSession = {
    id: testSessionId,
    taskId: testTaskId,
    profileId: testProfileId,
    startedAt: "2030-01-01T00:00:00.000Z",
    stoppedAt: "2030-01-01T00:25:00.000Z",
    createdAt: "2030-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSet.mockReturnValue({
      where: mockWhere,
    });
    mockWhere.mockReturnValue({
      returning: mockReturning,
    });
    mockReturning.mockResolvedValue([mockStoppedSession]);
  });

  it("ポモドーロセッションを停止できること", async () => {
    const { stopPomodoroSession } = await import(
      "../services/stopPomodoroSession"
    );

    const result = await stopPomodoroSession(testSessionId, testProfileId);

    expect(mockSet).toHaveBeenCalledWith({
      stoppedAt: expect.any(String),
    });
    expect(mockWhere).toHaveBeenCalled();
    expect(result).toEqual(mockStoppedSession);
  });

  it("DBが空配列を返した時に例外がスローされること", async () => {
    const { stopPomodoroSession } = await import(
      "../services/stopPomodoroSession"
    );
    mockReturning.mockResolvedValue([]);

    await expect(
      stopPomodoroSession(testSessionId, testProfileId)
    ).rejects.toThrow("Failed to stop pomodoro session");
  });

  it("DBエラー時に例外がスローされること", async () => {
    const { stopPomodoroSession } = await import(
      "../services/stopPomodoroSession"
    );
    mockReturning.mockRejectedValue(new Error("Database error"));

    await expect(
      stopPomodoroSession(testSessionId, testProfileId)
    ).rejects.toThrow("Database error");
  });
});
