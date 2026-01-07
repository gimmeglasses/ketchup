/**
 * createTaskAction のテストスイート
 * タスク作成処理の入力検証とサービス呼び出しが正しく動作することを確認
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { type SupabaseClient } from "@supabase/supabase-js";
import {
  createTaskAction,
  type CreateTaskActionResult,
} from "../actions/createTaskAction";
import * as service from "../services/createTask";
import * as supabaseServer from "@/lib/supabase/server";

// createTaskサービスをスパイ化
const mockCreatedTask = {
  id: "10000000-0000-0000-0000-000000000001",
  profileId: "test-user-id",
  title: "新しいタスク",
  estimatedMinutes: null,
  dueAt: null,
  completedAt: null,
  note: null,
  createdAt: "2030-01-01T00:00:00.000Z",
};
vi.spyOn(service, "createTask").mockResolvedValue(mockCreatedTask);

// Supabase クライアントをモック化
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

const initialState: CreateTaskActionResult = {
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
    } as unknown as SupabaseClient["auth"],
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
    } as unknown as SupabaseClient["auth"],
  };
  vi.mocked(supabaseServer.createSupabaseServerClient).mockResolvedValue(
    mockSupabase as SupabaseClient
  );
}

describe("createTaskAction", () => {
  describe("正常系", () => {
    it("タイトルのみで成功すること", async () => {
      setupAuthenticatedUser();

      const result = await createTaskAction(
        initialState,
        makeFormData({ title: "新しいタスク" })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.task).toEqual(mockCreatedTask);
      }
      expect(service.createTask).toHaveBeenCalledTimes(1);
      expect(service.createTask).toHaveBeenCalledWith("test-user-id", {
        title: "新しいタスク",
      });
    });

    it("全フィールドを指定して成功すること", async () => {
      setupAuthenticatedUser();
      const fullTask = {
        ...mockCreatedTask,
        estimatedMinutes: 60,
        dueAt: "2030-12-31T23:59:59.000Z",
        note: "これはメモです",
      };
      vi.mocked(service.createTask).mockResolvedValue(fullTask);

      const result = await createTaskAction(
        initialState,
        makeFormData({
          title: "詳細タスク",
          estimatedMinutes: "60",
          dueAt: "2030-12-31T23:59:59.000Z",
          note: "これはメモです",
        })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.task).toEqual(fullTask);
      }
      expect(service.createTask).toHaveBeenCalledWith("test-user-id", {
        title: "詳細タスク",
        estimatedMinutes: 60,
        dueAt: "2030-12-31T23:59:59.000Z",
        note: "これはメモです",
      });
    });

    it("空のオプションフィールドはundefinedとして渡されること", async () => {
      setupAuthenticatedUser();

      await createTaskAction(
        initialState,
        makeFormData({
          title: "タスク",
          estimatedMinutes: "",
          dueAt: "",
          note: "",
        })
      );

      expect(service.createTask).toHaveBeenCalledWith("test-user-id", {
        title: "タスク",
      });
    });
  });

  describe("バリデーションエラー", () => {
    it("タイトルが空の場合はエラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await createTaskAction(
        initialState,
        makeFormData({ title: "" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.title).toContain("タイトルを入力してください");
      }
      expect(service.createTask).not.toHaveBeenCalled();
    });

    it("タイトルがスペースのみの場合はエラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await createTaskAction(
        initialState,
        makeFormData({ title: "   " })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.title).toContain("タイトルを入力してください");
      }
      expect(service.createTask).not.toHaveBeenCalled();
    });

    it("タイトルが256文字以上の場合はエラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await createTaskAction(
        initialState,
        makeFormData({ title: "あ".repeat(256) })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.title).toContain(
          "タイトルは255文字以内で入力してください"
        );
      }
      expect(service.createTask).not.toHaveBeenCalled();
    });

    it("作業時間が0の場合はエラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await createTaskAction(
        initialState,
        makeFormData({ title: "タスク", estimatedMinutes: "0" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.estimatedMinutes).toContain(
          "作業時間は1分以上で入力してください"
        );
      }
      expect(service.createTask).not.toHaveBeenCalled();
    });

    it("作業時間が負の数の場合はエラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await createTaskAction(
        initialState,
        makeFormData({ title: "タスク", estimatedMinutes: "-10" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.estimatedMinutes).toContain(
          "作業時間は1分以上で入力してください"
        );
      }
      expect(service.createTask).not.toHaveBeenCalled();
    });

    it("作業時間が小数の場合はエラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await createTaskAction(
        initialState,
        makeFormData({ title: "タスク", estimatedMinutes: "30.5" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.estimatedMinutes).toContain(
          "作業時間は有効な整数で入力してください"
        );
      }
      expect(service.createTask).not.toHaveBeenCalled();
    });

    it("無効な日付形式の場合はエラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await createTaskAction(
        initialState,
        makeFormData({ title: "タスク", dueAt: "invalid-date" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.dueAt).toContain("有効な日付を入力してください");
      }
      expect(service.createTask).not.toHaveBeenCalled();
    });
  });

  describe("認証エラー", () => {
    it("未認証の場合はエラーを返すこと", async () => {
      setupUnauthenticatedUser();

      const result = await createTaskAction(
        initialState,
        makeFormData({ title: "タスク" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          "タスクを作成するにはログインが必要です。"
        );
      }
      expect(service.createTask).not.toHaveBeenCalled();
    });

    it("Supabaseクライアント生成に失敗した場合はエラーを返すこと", async () => {
      vi.mocked(supabaseServer.createSupabaseServerClient).mockRejectedValue(
        new Error("supabase down")
      );

      const result = await createTaskAction(
        initialState,
        makeFormData({ title: "タスク" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          "タスクの作成に失敗しました。時間をおいて再度お試しください。"
        );
      }
      expect(service.createTask).not.toHaveBeenCalled();
    });
  });

  describe("サービスエラー", () => {
    it("createTaskがエラーをスローした場合、適切にハンドリングすること", async () => {
      setupAuthenticatedUser();
      vi.mocked(service.createTask).mockRejectedValue(
        new Error("Database error")
      );

      const result = await createTaskAction(
        initialState,
        makeFormData({ title: "タスク" })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toContain(
          "タスクの作成に失敗しました。時間をおいて再度お試しください。"
        );
      }
      expect(service.createTask).toHaveBeenCalledTimes(1);
    });
  });
});
