/**
 * stopPomodoroAction のテストスイート
 * ポモドーロセッション停止処理の入力検証とサービス呼び出しが正しく動作することを確認
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { type SupabaseClient } from "@supabase/supabase-js";
import {
  stopPomodoroAction,
  type StopPomodoroActionResult,
} from "../actions/stopPomodoroAction";
import * as service from "../services/stopPomodoroSession";
import * as supabaseServer from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// stopPomodoroSession サービスをスパイ化
const mockStoppedSession = {
  id: "10000000-0000-4000-8000-000000000001",
  profileId: "test-user-id",
  taskId: "20000000-0000-4000-8000-000000000001",
  startedAt: "2030-01-01T00:00:00.000Z",
  stoppedAt: "2030-01-01T00:25:00.000Z",
  createdAt: "2030-01-01T00:00:00.000Z",
};
vi.spyOn(service, "stopPomodoroSession").mockResolvedValue(
  mockStoppedSession
);

// Supabase クライアントをモック化
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

// revalidatePath をモック化
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

const initialState: StopPomodoroActionResult = {
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

describe("stopPomodoroAction", () => {
  describe("正常系", () => {
    it("有効なsessionIdでセッション停止が成功すること", async () => {
      setupAuthenticatedUser();
      vi.mocked(service.stopPomodoroSession).mockResolvedValue(
        mockStoppedSession
      );

      const result = await stopPomodoroAction(
        initialState,
        makeFormData({ sessionId: "10000000-0000-4000-8000-000000000001" })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.session).toEqual(mockStoppedSession);
      }
      expect(service.stopPomodoroSession).toHaveBeenCalledWith(
        "10000000-0000-4000-8000-000000000001",
        "test-user-id"
      );
    });

    it("セッション停止成功時にrevalidatePathが呼ばれること", async () => {
      setupAuthenticatedUser();
      vi.mocked(service.stopPomodoroSession).mockResolvedValue(
        mockStoppedSession
      );

      await stopPomodoroAction(
        initialState,
        makeFormData({ sessionId: "10000000-0000-4000-8000-000000000001" })
      );

      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("バリデーションエラー", () => {
    it("sessionIdが空の場合はエラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await stopPomodoroAction(
        initialState,
        makeFormData({ sessionId: "" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.sessionId).toBeDefined();
      }
      expect(service.stopPomodoroSession).not.toHaveBeenCalled();
    });

    it("sessionIdがUUID形式でない場合はエラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await stopPomodoroAction(
        initialState,
        makeFormData({ sessionId: "invalid-uuid" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.sessionId).toContain("Invalid session ID");
      }
      expect(service.stopPomodoroSession).not.toHaveBeenCalled();
    });

    it("バリデーションエラー時に入力値が返されること", async () => {
      setupAuthenticatedUser();

      const result = await stopPomodoroAction(
        initialState,
        makeFormData({ sessionId: "invalid" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.values).toEqual({
          sessionId: "invalid",
        });
      }
    });
  });

  describe("認証エラー", () => {
    it("未認証の場合はエラーを返すこと", async () => {
      setupUnauthenticatedUser();

      const result = await stopPomodoroAction(
        initialState,
        makeFormData({ sessionId: "10000000-0000-4000-8000-000000000001" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          "ポモドーロセッションを停止するにはログインが必要です。"
        );
      }
      expect(service.stopPomodoroSession).not.toHaveBeenCalled();
    });

    it("未認証の場合でも入力値が返されること", async () => {
      setupUnauthenticatedUser();

      const result = await stopPomodoroAction(
        initialState,
        makeFormData({ sessionId: "10000000-0000-4000-8000-000000000001" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.values).toEqual({
          sessionId: "10000000-0000-4000-8000-000000000001",
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

      const result = await stopPomodoroAction(
        initialState,
        makeFormData({ sessionId: "10000000-0000-4000-8000-000000000001" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          "ポモドーロセッションの停止に失敗しました。時間をおいて再度お試しください。"
        );
      }
      expect(service.stopPomodoroSession).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("サービスエラー", () => {
    it("stopPomodoroSessionがエラーをスローした場合、適切にハンドリングすること", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      setupAuthenticatedUser();
      vi.mocked(service.stopPomodoroSession).mockRejectedValue(
        new Error("Database error")
      );

      const result = await stopPomodoroAction(
        initialState,
        makeFormData({ sessionId: "10000000-0000-4000-8000-000000000001" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          "ポモドーロセッションの停止に失敗しました。時間をおいて再度お試しください。"
        );
      }
      expect(service.stopPomodoroSession).toHaveBeenCalledTimes(1);
      consoleErrorSpy.mockRestore();
    });

    it("サービスエラー時でも入力値が返されること", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      setupAuthenticatedUser();
      vi.mocked(service.stopPomodoroSession).mockRejectedValue(
        new Error("Database error")
      );

      const result = await stopPomodoroAction(
        initialState,
        makeFormData({ sessionId: "10000000-0000-4000-8000-000000000001" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.values).toEqual({
          sessionId: "10000000-0000-4000-8000-000000000001",
        });
      }
      consoleErrorSpy.mockRestore();
    });
  });
});
