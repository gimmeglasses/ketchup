import { describe, it, expect, beforeEach, vi } from "vitest";

const mockSet = vi.fn();
const mockWhere = vi.fn();
const mockReturning = vi.fn();

vi.mock("@/app/db/client", () => ({
  db: {
    update: () => ({
      set: (args: string) => {
        mockSet(args);
        return {
          where: (cond: string) => mockWhere(cond),
        };
      },
    }),
  },
}));

describe("updateTask", () => {
  const mockUpdatedTask = {
    id: "10000000-0000-0000-0000-000000000001",
    title: "更新後のタスク",
    estimatedMinutes: 50,
    dueAt: "2026-02-03",
    note: "説明の更新",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSet.mockReturnValue({
      where: mockWhere,
    });
    mockWhere.mockReturnValue({
      returning: mockReturning,
    });
    mockReturning.mockResolvedValue([mockUpdatedTask]);
  });

  it("有効なタスクの更新を行うことができること", async () => {
    const { updateTask } = await import("../services/updateTask");

    const result = await updateTask({
      id: mockUpdatedTask.id,
      title: mockUpdatedTask.title,
      estimatedMinutes: 50,
      dueAt: mockUpdatedTask.dueAt,
      note: mockUpdatedTask.note,
    });
    expect(mockSet).toHaveBeenCalledWith({
      title: mockUpdatedTask.title,
      estimatedMinutes: 50,
      dueAt: mockUpdatedTask.dueAt,
      note: mockUpdatedTask.note,
    });
    expect(result).toEqual(mockUpdatedTask);
  });

  it("有効なタスクの更新を行うことができること(null含む)", async () => {
    const { updateTask } = await import("../services/updateTask");
    const mockUpdatedTaskNull = {
      ...mockUpdatedTask,
      title: "更新後のタスク(null含む)",
      estimatedMinutes: null,
      dueAt: null,
      note: null,
    };
    mockReturning.mockResolvedValue([mockUpdatedTaskNull]);
    const result = await updateTask({
      id: mockUpdatedTaskNull.id,
      title: mockUpdatedTaskNull.title,
      estimatedMinutes: null,
      dueAt: null,
      note: null,
    });
    expect(mockSet).toHaveBeenCalledWith({
      title: mockUpdatedTaskNull.title,
      estimatedMinutes: null,
      dueAt: null,
      note: null,
    });
    expect(result).toEqual(mockUpdatedTaskNull);
  });

  it("DBが空配列を返した時に例外がスローされること", async () => {
    const { updateTask } = await import("../services/updateTask");
    mockReturning.mockResolvedValue([]);

    await expect(
      updateTask({
        id: mockUpdatedTask.id,
        title: mockUpdatedTask.title,
        estimatedMinutes: null,
        dueAt: null,
        note: null,
      }),
    ).rejects.toThrow("Failed to update task");
  });

  it("DBエラー時に例外がスローされること", async () => {
    const { updateTask } = await import("../services/updateTask");
    mockReturning.mockRejectedValue(new Error("Database error"));

    await expect(
      updateTask({
        id: mockUpdatedTask.id,
        title: mockUpdatedTask.title,
        estimatedMinutes: null,
        dueAt: null,
        note: null,
      }),
    ).rejects.toThrow("Database error");
  });
});
