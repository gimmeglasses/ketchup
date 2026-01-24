import { describe, it, expect, beforeEach, vi } from "vitest";

const mockWhere = vi.fn();

vi.mock("@/app/db/client", () => ({
  db: {
    delete: () => ({
      where: (cond: unknown) => mockWhere(cond),
    }),
  },
}));

describe("deleteTask", () => {
  const testTaskId = "10000000-0000-0000-0000-000000000001";

  beforeEach(() => {
    vi.clearAllMocks();
    mockWhere.mockResolvedValue({ count: 1 });
  });

  it("指定された値で削除が実行されること", async () => {
    const { deleteTask } = await import("../services/deleteTask");

    await deleteTask(testTaskId);

    expect(mockWhere).toHaveBeenCalledTimes(1);
  });

  it("タスクが存在しない、または既に完了している場合にエラーを投げること", async () => {
    const { deleteTask } = await import("../services/deleteTask");

    // 失敗時: 0件更新のモック
    mockWhere.mockResolvedValue({ count: 1 });

    await expect(deleteTask(testTaskId)).rejects.toThrow(
      "Failed to delete task",
    );
  });
});
