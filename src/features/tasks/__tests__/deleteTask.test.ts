import { describe, it, expect, beforeEach, vi } from "vitest";

const mockSelectWhere = vi.fn();
const mockDeleteWhere = vi.fn();

vi.mock("@/app/db/client", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: mockSelectWhere,
      }),
    }),
    delete: () => ({
      where: mockDeleteWhere,
    }),
  },
}));

describe("deleteTask", () => {
  const testTaskId = "10000000-0000-0000-0000-000000000001";
  const mockTask = {
    id: testTaskId,
    title: "Test Task",
    profileId: "profile-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルト: タスクが存在する
    mockSelectWhere.mockResolvedValue([mockTask]);
    mockDeleteWhere.mockResolvedValue(undefined);
  });

  it("指定された値で削除が実行されること", async () => {
    const { deleteTask } = await import("../services/deleteTask");

    await deleteTask(testTaskId);

    expect(mockSelectWhere).toHaveBeenCalledTimes(1);
    expect(mockDeleteWhere).toHaveBeenCalledTimes(1);
  });

  it("タスクが存在しない場合にエラーを投げること", async () => {
    const { deleteTask } = await import("../services/deleteTask");

    // タスクが存在しない
    mockSelectWhere.mockResolvedValue([]);

    await expect(deleteTask(testTaskId)).rejects.toThrow("Task not found");
    expect(mockDeleteWhere).not.toHaveBeenCalled();
  });
});
