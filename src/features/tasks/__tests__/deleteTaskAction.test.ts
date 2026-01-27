import { describe, it, expect, vi, afterEach } from "vitest";
import { type SupabaseClient } from "@supabase/supabase-js";
import { deleteTaskAction } from "../actions/deleteTaskAction";
import * as service from "../services/deleteTask";
import * as supabaseServer from "@/lib/supabase/server";

// deleteTaskサービスをスパイ化
vi.spyOn(service, "deleteTask").mockResolvedValue(undefined);

// Supabase クライアントをモック化
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

/**
 * 認証済みユーザーのモックを設定するヘルパー関数
 */
function setupAuthenticatedUser(userId = "test-user-id") {
  const mockUser = { id: userId };
  const mockSupabase: Partial<SupabaseClient> = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
    } as Partial<SupabaseClient["auth"]> as SupabaseClient["auth"],
  };
  vi.mocked(supabaseServer.createSupabaseServerClient).mockResolvedValue(
    mockSupabase as SupabaseClient,
  );
}

/**
 * 未認証ユーザーのモックを設定するヘルパー関数
 */
function setupUnauthenticatedUser() {
  const mockSupabase: Partial<SupabaseClient> = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    } as Partial<SupabaseClient["auth"]> as SupabaseClient["auth"],
  };
  vi.mocked(supabaseServer.createSupabaseServerClient).mockResolvedValue(
    mockSupabase as SupabaseClient,
  );
}

describe("deleteTaskAction", () => {
  const taskId = "10000000-0000-0000-0000-000000000001";

  describe("正常系", () => {
    it("タスク削除に成功すること", async () => {
      setupAuthenticatedUser();
      const result = await deleteTaskAction(taskId);

      expect(result.success).toBe(true);
      expect(service.deleteTask).toHaveBeenCalledWith(taskId);
    });
  });

  describe("認証エラー", () => {
    it("未認証の場合はエラーを返すこと", async () => {
      setupUnauthenticatedUser();

      const result = await deleteTaskAction(taskId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors?._form).toContain(
          "タスクを削除するにはログインが必要です。",
        );
      }
      expect(service.deleteTask).not.toHaveBeenCalled();
    });

    it("Supabaseクライアント生成に失敗した場合はエラーを返すこと", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      vi.mocked(supabaseServer.createSupabaseServerClient).mockRejectedValue(
        new Error("supabase down"),
      );

      const result = await deleteTaskAction(taskId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors?._form).toContain(
          "タスクの削除に失敗しました。時間をおいて再度お試しください。",
        );
      }
      expect(service.deleteTask).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("サービスエラー", () => {
    it("deleteTaskがエラーをスローした場合、適切にハンドリングすること", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      setupAuthenticatedUser();
      vi.mocked(service.deleteTask).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await deleteTaskAction(taskId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors?._form).toContain(
          "タスクの削除に失敗しました。時間をおいて再度お試しください。",
        );
      }
      expect(service.deleteTask).toHaveBeenCalledTimes(1);
      consoleErrorSpy.mockRestore();
    });
  });
});
