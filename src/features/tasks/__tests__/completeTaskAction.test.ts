/**
 * completeTaskAction のテスト
 * タスク完了処理のサービス呼び出しが正しく動作することを確認
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { type SupabaseClient } from "@supabase/supabase-js";
import {
  completeTaskAction,
  type CompleteTaskResult,
} from "../actions/completeTaskAction";
import * as service from "../services/completeTask";
import * as supabaseServer from "@/lib/supabase/server";

// モックデータを作成
const mockCreatedTask = {
  id: "10000000-0000-0000-0000-000000000001",
  profileId: "test-user-id",
  title: "新しいタスク",
  completedAt: null,
  createdAt: null,
};

// completeTaskサービスをスパイ化
vi.spyOn(service, "completeTask").mockResolvedValue(mockCreatedTask);

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

const initialState: CompleteTaskResult = {
  success: false,
  errors: {},
};

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
    mockSupabase as SupabaseClient
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
    mockSupabase as SupabaseClient
  );
}

describe("completeTaskAction", () => {
  describe("正常系", () => {
    it("タスク完了に成功すること", async () => {
      setupAuthenticatedUser();
      const taskId = "10000000-0000-0000-0000-000000000001";
      const result = await completeTaskAction(taskId);

      expect(result.success).toBe(true);
      expect(service.completeTask).toHaveBeenCalledWith(
        taskId,
        expect.any(String)
      );
    });
  });

  describe("認証エラー", () => {
    it("未認証の場合はエラーを返すこと", async () => {
      setupUnauthenticatedUser();

      const result = await completeTaskAction(
        initialState,
        makeFormData({ title: "タスク" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          "タスクを完了するにはログインが必要です。"
        );
      }
      expect(service.completeTask).not.toHaveBeenCalled();
    });

    it("Supabaseクライアント生成に失敗した場合はエラーを返すこと", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      vi.mocked(supabaseServer.createSupabaseServerClient).mockRejectedValue(
        new Error("supabase down")
      );

      const result = await completeTaskAction(taskId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          "タスクの完了に失敗しました。時間をおいて再度お試しください。"
        );
      }
      expect(service.completeTask).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("サービスエラー", () => {
    it("completeTaskがエラーをスローした場合、適切にハンドリングすること", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      setupAuthenticatedUser();
      vi.mocked(service.completeTask).mockRejectedValue(
        new Error("Database error")
      );

      const result = await completeTaskAction(taskId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          "タスクの完了に失敗しました。時間をおいて再度お試しください。"
        );
      }
      expect(service.completeTask).toHaveBeenCalledTimes(1);
      consoleErrorSpy.mockRestore();
    });
  });
});
