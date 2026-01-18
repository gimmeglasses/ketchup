/**
 * completeTask サービスのテスト
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
      // ここで mockValues を返す
      set: (args: string) => {
        mockSet(args); // 呼び出しを記録
        return {
          where: (cond: string) => {
            mockWhere(cond);
            return { returning: mockReturning };
          },
        };
      },
    }),
  },
}));

describe("completeTaskAction", () => {
  const testTaskId = "10000000-0000-0000-0000-000000000001";
  const testCompletedAt = "2026-01-18 06:45:53.747+00";
  const mockCompletedTask = {
    id: testTaskId,
    // profileId: testUserId,
    title: "新しいタスク",
    completedAt: testCompletedAt,
    createdAt: "2030-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockReturning.mockResolvedValue([mockCompletedTask]);
  });

  it("タスクを完了できること", async () => {
    const { completeTask } = await import("../services/completeTask");
    const { eq } = await import("drizzle-orm");
    const { tasks } = await import("@/app/db/schema");

    const result = await completeTask(testTaskId, testCompletedAt);

    expect(mockSet).toHaveBeenCalledWith({
      completedAt: testCompletedAt,
    });

    expect(mockWhere).toHaveBeenCalledWith(eq(tasks.id, testTaskId));

    expect(result).toEqual(mockCompletedTask);
  });
});
