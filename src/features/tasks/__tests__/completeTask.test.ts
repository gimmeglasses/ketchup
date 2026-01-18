/**
 * completeTask サービスのテスト
 * Drizzleクライアントをモック化してテスト
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// DBクライアントをモック化
const mockSet = vi.fn();
const mockWhere = vi.fn();

vi.mock("@/app/db/client", () => ({
  db: {
    update: () => ({
      // ここで mockValues を返す
      set: (args: string) => {
        mockSet(args); // 呼び出しを記録
        return {
          // where が直接 mockWhere(cond) の戻り値を返すように変更
          where: (cond: string) => mockWhere(cond),
        };
      },
    }),
  },
}));

describe("completeTaskAction", () => {
  const testTaskId = "10000000-0000-0000-0000-000000000001";

  beforeEach(() => {
    vi.clearAllMocks();
    mockWhere.mockResolvedValue({ count: 1 });
  });

  it("指定された値で更新が実行されること (setの検証)", async () => {
    const { completeTask } = await import("../services/completeTask");

    await completeTask(testTaskId);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        completedAt: expect.anything(), // sql`now()` はオブジェクトとして渡される
      }),
    );
  });

  it("正しい条件でレコードが絞り込まれること (whereの検証)", async () => {
    const { completeTask } = await import("../services/completeTask");
    const { eq, and, isNull } = await import("drizzle-orm");
    const { tasks } = await import("@/app/db/schema");

    await completeTask(testTaskId);

    expect(mockWhere).toHaveBeenCalledWith(
      and(eq(tasks.id, testTaskId), isNull(tasks.completedAt)),
    );
  });

  it("タスクが存在しない、または既に完了している場合にエラーを投げること", async () => {
    const { completeTask } = await import("../services/completeTask");

    // 失敗時: 0件更新のモック
    mockWhere.mockResolvedValue({ count: 0 });

    await expect(completeTask(testTaskId)).rejects.toThrow(
      "Task not found or already completed",
    );
  });
});
