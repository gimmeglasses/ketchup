/**
 * getActiveSession サービスのテスト
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

describe("getActiveSession", () => {
  const testProfileId = "00000000-0000-0000-0000-000000000001";
  const testTaskId = "10000000-0000-0000-0000-000000000001";
  const mockActiveSession = {
    id: "20000000-0000-0000-0000-000000000001",
    taskId: testTaskId,
    profileId: testProfileId,
    startedAt: "2030-01-01T00:00:00.000Z",
    stoppedAt: null,
    createdAt: "2030-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      where: mockWhere,
    });
  });

  it("未完了のセッションが存在する場合、そのセッションを返すこと", async () => {
    const { getActiveSession } = await import(
      "../services/getActiveSession"
    );
    mockWhere.mockResolvedValue([mockActiveSession]);

    const result = await getActiveSession(testProfileId, testTaskId);

    expect(mockFrom).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
    expect(result).toEqual(mockActiveSession);
  });

  it("セッションが存在しない場合はnullを返すこと", async () => {
    const { getActiveSession } = await import(
      "../services/getActiveSession"
    );
    mockWhere.mockResolvedValue([]);

    const result = await getActiveSession(testProfileId, testTaskId);

    expect(result).toBeNull();
  });

  it("DBエラー時に例外がスローされること", async () => {
    const { getActiveSession } = await import(
      "../services/getActiveSession"
    );
    mockWhere.mockRejectedValue(new Error("Database error"));

    await expect(
      getActiveSession(testProfileId, testTaskId)
    ).rejects.toThrow("Database error");
  });
});
