/**
 * createPomodoroSession サービスのテスト
 * Drizzleクライアントをモック化してテスト
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// DBクライアントをモック化
const mockValues = vi.fn();
const mockReturning = vi.fn();

vi.mock("@/app/db/client", () => ({
  db: {
    insert: () => ({
      values: mockValues,
    }),
  },
}));

describe("createPomodoroSession", () => {
  const testProfileId = "00000000-0000-0000-0000-000000000001";
  const testTaskId = "10000000-0000-0000-0000-000000000001";
  const mockCreatedSession = {
    id: "20000000-0000-0000-0000-000000000001",
    taskId: testTaskId,
    profileId: testProfileId,
    startedAt: "2030-01-01T00:00:00.000Z",
    stoppedAt: null,
    createdAt: "2030-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockValues.mockReturnValue({
      returning: mockReturning,
    });
    mockReturning.mockResolvedValue([mockCreatedSession]);
  });

  it("新しいポモドーロセッションを作成できること", async () => {
    const { createPomodoroSession } = await import(
      "../services/createPomodoroSession"
    );

    const result = await createPomodoroSession(testProfileId, testTaskId);

    expect(mockValues).toHaveBeenCalledWith({
      profileId: testProfileId,
      taskId: testTaskId,
      startedAt: expect.any(String),
      stoppedAt: null,
    });
    expect(result).toEqual(mockCreatedSession);
  });

  it("DBが空配列を返した時に例外がスローされること", async () => {
    const { createPomodoroSession } = await import(
      "../services/createPomodoroSession"
    );
    mockReturning.mockResolvedValue([]);

    await expect(
      createPomodoroSession(testProfileId, testTaskId)
    ).rejects.toThrow("Failed to create pomodoro session");
  });

  it("DBエラー時に例外がスローされること", async () => {
    const { createPomodoroSession } = await import(
      "../services/createPomodoroSession"
    );
    mockReturning.mockRejectedValue(new Error("Database error"));

    await expect(
      createPomodoroSession(testProfileId, testTaskId)
    ).rejects.toThrow("Database error");
  });
});
