import { describe, it, expect, beforeEach, vi } from "vitest";

const mockDeleteWhere = vi.fn();

vi.mock("@/app/db/client", () => ({
  db: {
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
    mockDeleteWhere.mockResolvedValue(undefined);
  });

  it("指定された値で削除が実行されること", async () => {
    const { deleteTask } = await import("../services/deleteTask");

    await deleteTask(testTaskId);

    expect(mockDeleteWhere).toHaveBeenCalledTimes(1);
  });
});
