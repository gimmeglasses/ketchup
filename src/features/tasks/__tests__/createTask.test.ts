/**
 * createTask サービスのテスト
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

describe("createTask", () => {
  const testUserId = "00000000-0000-0000-0000-000000000001";
  const mockCreatedTask = {
    id: "10000000-0000-0000-0000-000000000001",
    profileId: testUserId,
    title: "新しいタスク",
    estimatedMinutes: null,
    dueAt: null,
    completedAt: null,
    note: null,
    createdAt: "2030-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockValues.mockReturnValue({
      returning: mockReturning,
    });
    mockReturning.mockResolvedValue([mockCreatedTask]);
  });

  it("必須フィールドのみでタスクを作成できること", async () => {
    const { createTask } = await import("../services/createTask");

    const result = await createTask(testUserId, {
      title: "新しいタスク",
    });

    expect(mockValues).toHaveBeenCalledWith({
      profileId: testUserId,
      title: "新しいタスク",
      estimatedMinutes: undefined,
      dueAt: undefined,
      note: undefined,
    });
    expect(result).toEqual(mockCreatedTask);
  });

  it("全フィールドを指定してタスクを作成できること", async () => {
    const { createTask } = await import("../services/createTask");
    const dueAt = "2030-12-31T23:59:59.000Z";
    const fullTask = {
      ...mockCreatedTask,
      title: "詳細タスク",
      estimatedMinutes: 60,
      dueAt,
      note: "これはメモです",
    };
    mockReturning.mockResolvedValue([fullTask]);

    const result = await createTask(testUserId, {
      title: "詳細タスク",
      estimatedMinutes: 60,
      dueAt,
      note: "これはメモです",
    });

    expect(mockValues).toHaveBeenCalledWith({
      profileId: testUserId,
      title: "詳細タスク",
      estimatedMinutes: 60,
      dueAt,
      note: "これはメモです",
    });
    expect(result).toEqual(fullTask);
  });

  it("undefinedのフィールドはundefinedとして渡されること", async () => {
    const { createTask } = await import("../services/createTask");

    await createTask(testUserId, {
      title: "タスク",
      estimatedMinutes: undefined,
      dueAt: undefined,
      note: undefined,
    });

    expect(mockValues).toHaveBeenCalledWith({
      profileId: testUserId,
      title: "タスク",
      estimatedMinutes: undefined,
      dueAt: undefined,
      note: undefined,
    });
  });

  it("DBが空配列を返した時に例外がスローされること", async () => {
    const { createTask } = await import("../services/createTask");
    mockReturning.mockResolvedValue([]);

    await expect(
      createTask(testUserId, { title: "タスク" })
    ).rejects.toThrow("Failed to create task");
  });

  it("DBエラー時に例外がスローされること", async () => {
    const { createTask } = await import("../services/createTask");
    mockReturning.mockRejectedValue(new Error("Database error"));

    await expect(
      createTask(testUserId, { title: "タスク" })
    ).rejects.toThrow("Database error");
  });
});
