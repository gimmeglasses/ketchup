/**
 * getCurrentSessionAction のテストスイート
 * 現在のアクティブなポモドーロセッション取得処理の入力検証とサービス呼び出しが正しく動作することを確認
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { type SupabaseClient } from "@supabase/supabase-js";
import {
  getCurrentSessionAction,
  type GetCurrentSessionActionResult,
} from "../actions/getCurrentSessionAction";
import * as service from "../services/getActiveSession";
import * as supabaseServer from "@/lib/supabase/server";

// getActiveSession サービスをスパイ化
const mockActiveSession = {
  id: "10000000-0000-4000-8000-000000000001",
  profileId: "test-user-id",
  taskId: "20000000-0000-4000-8000-000000000001",
  startedAt: "2030-01-01T00:00:00.000Z",
  stoppedAt: null,
  createdAt: "2030-01-01T00:00:00.000Z",
};
vi.spyOn(service, "getActiveSession").mockResolvedValue(mockActiveSession);

// Supabase クライアントをモック化
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

const initialState: GetCurrentSessionActionResult = {
  success: false,
  errors: {},
};

/**
 * FormData オブジェクトを生成するヘルパー関数
 */
function makeFormData(values: Record<string, string>) {
  const fd = new FormData();
  Object.entries(values).forEach(([key, value]) => fd.append(key, value));
  return fd;
}

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

describe("getCurrentSessionAction", () => {
  describe("正常系", () => {
    it("有効なtaskIdでアクティブなセッションが取得できること", async () => {
      setupAuthenticatedUser();
      vi.mocked(service.getActiveSession).mockResolvedValue(mockActiveSession);

      const result = await getCurrentSessionAction(
        initialState,
        makeFormData({ taskId: "20000000-0000-4000-8000-000000000001" })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.session).toEqual(mockActiveSession);
      }
      expect(service.getActiveSession).toHaveBeenCalledWith(
        "test-user-id",
        "20000000-0000-4000-8000-000000000001"
      );
    });

    it("アクティブなセッションが存在しない場合はnullを返すこと", async () => {
      setupAuthenticatedUser();
      vi.mocked(service.getActiveSession).mockResolvedValue(null);

      const result = await getCurrentSessionAction(
        initialState,
        makeFormData({ taskId: "20000000-0000-4000-8000-000000000001" })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.session).toBeNull();
      }
    });
  });

  describe("バリデーションエラー", () => {
    it("taskIdが空の場合はエラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await getCurrentSessionAction(
        initialState,
        makeFormData({ taskId: "" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.taskId).toBeDefined();
      }
      expect(service.getActiveSession).not.toHaveBeenCalled();
    });

    it("taskIdがUUID形式でない場合はエラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await getCurrentSessionAction(
        initialState,
        makeFormData({ taskId: "invalid-uuid" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.taskId).toContain("Invalid task ID");
      }
      expect(service.getActiveSession).not.toHaveBeenCalled();
    });

    it("バリデーションエラー時に入力値が返されること", async () => {
      setupAuthenticatedUser();

      const result = await getCurrentSessionAction(
        initialState,
        makeFormData({ taskId: "invalid" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.values).toEqual({
          taskId: "invalid",
        });
      }
    });
  });

  describe("認証エラー", () => {
    it("未認証の場合はエラーを返すこと", async () => {
      setupUnauthenticatedUser();

      const result = await getCurrentSessionAction(
        initialState,
        makeFormData({ taskId: "20000000-0000-4000-8000-000000000001" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          "ポモドーロセッションを取得するにはログインが必要です。"
        );
      }
      expect(service.getActiveSession).not.toHaveBeenCalled();
    });

    it("未認証の場合でも入力値が返されること", async () => {
      setupUnauthenticatedUser();

      const result = await getCurrentSessionAction(
        initialState,
        makeFormData({ taskId: "20000000-0000-4000-8000-000000000001" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.values).toEqual({
          taskId: "20000000-0000-4000-8000-000000000001",
        });
      }
    });

    it("Supabaseクライアント生成に失敗した場合はエラーを返すこと", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      vi.mocked(supabaseServer.createSupabaseServerClient).mockRejectedValue(
        new Error("supabase down")
      );

      const result = await getCurrentSessionAction(
        initialState,
        makeFormData({ taskId: "20000000-0000-4000-8000-000000000001" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          "ポモドーロセッションの取得に失敗しました。時間をおいて再度お試しください。"
        );
      }
      expect(service.getActiveSession).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("サービスエラー", () => {
    it("getActiveSessionがエラーをスローした場合、適切にハンドリングすること", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      setupAuthenticatedUser();
      vi.mocked(service.getActiveSession).mockRejectedValue(
        new Error("Database error")
      );

      const result = await getCurrentSessionAction(
        initialState,
        makeFormData({ taskId: "20000000-0000-4000-8000-000000000001" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          "ポモドーロセッションの取得に失敗しました。時間をおいて再度お試しください。"
        );
      }
      expect(service.getActiveSession).toHaveBeenCalledTimes(1);
      consoleErrorSpy.mockRestore();
    });

    it("サービスエラー時でも入力値が返されること", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      setupAuthenticatedUser();
      vi.mocked(service.getActiveSession).mockRejectedValue(
        new Error("Database error")
      );

      const result = await getCurrentSessionAction(
        initialState,
        makeFormData({ taskId: "20000000-0000-4000-8000-000000000001" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.values).toEqual({
          taskId: "20000000-0000-4000-8000-000000000001",
        });
      }
      consoleErrorSpy.mockRestore();
    });
  });
});
