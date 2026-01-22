import { describe, it, expect, vi, afterEach } from "vitest";
import { type SupabaseClient } from "@supabase/supabase-js";
import {
  updateTaskAction,
  type UpdatedTaskActionResult,
} from "../actions/updateTaskAction";
import * as service from "../services/updateTask";
import * as supabaseServer from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Supabase クライアントをモック化
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

// next/cache をモック化
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("../services/updateTask", () => ({
  updateTask: vi.fn(),
}));

// 全てのモックデータを初期化する
afterEach(() => {
  vi.clearAllMocks();
});

// 初期化
const initialState: UpdatedTaskActionResult = {
  success: false,
  errors: {},
};

// FormDataオブジェクトを生成するヘルパー関数(FormDataをkey-valueで追加していく)
function makeFormData(value: Record<string, string>) {
  const fd = new FormData();
  Object.entries(value).forEach(([key, value]) => fd.append(key, value));
  return fd;
}

// 認証済みユーザのモックを設定するヘルパー関数
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

// 未認証済みユーザのモックを設定するヘルパー関数
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

// service をモック化

describe("updateTaskAction", () => {
  const mockUpdatedTask = {
    id: "10000000-0000-4000-8000-000000000001",
    title: "更新後のタスク",
    estimatedMinutes: "50",
    dueAt: "2026-02-03",
    note: "説明の更新",
  };
  vi.mocked(service.updateTask).mockResolvedValue(mockUpdatedTask);

  describe("正常系", () => {
    it("有効なデータの更新が成功すること", async () => {
      // 認証済みユーザ取得
      setupAuthenticatedUser();
      const result = await updateTaskAction(
        initialState,
        makeFormData({
          id: mockUpdatedTask.id,
          title: mockUpdatedTask.title,
          estimatedMinutes: "50", // 更新値
          dueAt: mockUpdatedTask.dueAt,
          note: mockUpdatedTask.note,
        }),
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.task).toEqual(mockUpdatedTask);
      }
      expect(service.updateTask).toHaveBeenCalledTimes(1);
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("有効なデータの更新が成功すること(null含む)", async () => {
      // 認証済みユーザ取得
      setupAuthenticatedUser();
      const mockUpdatedTaskNull = {
        ...mockUpdatedTask,
        estimatedMinutes: "",
        dueAt: "",
        note: "",
      };
      vi.mocked(service.updateTask).mockResolvedValue(mockUpdatedTaskNull);

      const result = await updateTaskAction(
        initialState,
        makeFormData({
          id: mockUpdatedTask.id,
          title: mockUpdatedTask.title,
          estimatedMinutes: "", // 更新値 (blank文字は null に変換される)
          dueAt: "", // 更新値 (blank文字は null に変換される)
          note: "", // 更新値 (blank文字は null に変換される)
        }),
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.task).toEqual(mockUpdatedTaskNull);
      }
      expect(service.updateTask).toHaveBeenCalledTimes(1);
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("タイトルのトリミングが正しく行われること", async () => {
      setupAuthenticatedUser();

      const result = await updateTaskAction(
        initialState,
        makeFormData({
          id: mockUpdatedTask.id,
          title: "  トリミングされるタスク  ",
          estimatedMinutes: "30",
          dueAt: "2026-02-01",
          note: "メモ",
        }),
      );

      expect(result.success).toBe(true);
      expect(service.updateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "トリミングされるタスク",
        }),
      );
    });

    it("estimatedMinutesが文字列から数値に変換されること", async () => {
      setupAuthenticatedUser();

      const result = await updateTaskAction(
        initialState,
        makeFormData({
          id: mockUpdatedTask.id,
          title: "テストタスク",
          estimatedMinutes: "120",
          dueAt: "2026-02-01",
          note: "メモ",
        }),
      );

      expect(result.success).toBe(true);
      expect(service.updateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          estimatedMinutes: 120,
        }),
      );
    });
  });

  describe("異常系 - バリデーションエラー", () => {
    it("無効なUUIDの場合エラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await updateTaskAction(
        initialState,
        makeFormData({
          id: "invalid-uuid",
          title: "テストタスク",
          estimatedMinutes: "30",
          dueAt: "2026-02-01",
          note: "メモ",
        }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.id).toBeDefined();
        expect(result.values?.id).toBe("invalid-uuid");
      }
      expect(service.updateTask).not.toHaveBeenCalled();
    });

    it("タイトルが空の場合エラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await updateTaskAction(
        initialState,
        makeFormData({
          id: mockUpdatedTask.id,
          title: "",
          estimatedMinutes: "30",
          dueAt: "2026-02-01",
          note: "メモ",
        }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.title).toBeDefined();
        expect(result.errors.title).toContain("タイトルを入力してください");
      }
      expect(service.updateTask).not.toHaveBeenCalled();
    });

    it("タイトルがスペースのみの場合エラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await updateTaskAction(
        initialState,
        makeFormData({
          id: mockUpdatedTask.id,
          title: "   ",
          estimatedMinutes: "30",
          dueAt: "2026-02-01",
          note: "メモ",
        }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.title).toBeDefined();
      }
      expect(service.updateTask).not.toHaveBeenCalled();
    });

    it("タイトルが255文字を超える場合エラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await updateTaskAction(
        initialState,
        makeFormData({
          id: mockUpdatedTask.id,
          title: "a".repeat(256),
          estimatedMinutes: "30",
          dueAt: "2026-02-01",
          note: "メモ",
        }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.title).toBeDefined();
        expect(result.errors.title).toContain(
          "タイトルは255文字以内で入力してください",
        );
      }
      expect(service.updateTask).not.toHaveBeenCalled();
    });

    it("estimatedMinutesが小数の場合エラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await updateTaskAction(
        initialState,
        makeFormData({
          id: mockUpdatedTask.id,
          title: "テストタスク",
          estimatedMinutes: "30.5",
          dueAt: "2026-02-01",
          note: "メモ",
        }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.estimatedMinutes).toBeDefined();
        expect(result.errors.estimatedMinutes).toContain(
          "作業時間は有効な整数で入力してください",
        );
      }
      expect(service.updateTask).not.toHaveBeenCalled();
    });

    it("estimatedMinutesが0の場合エラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await updateTaskAction(
        initialState,
        makeFormData({
          id: mockUpdatedTask.id,
          title: "テストタスク",
          estimatedMinutes: "0",
          dueAt: "2026-02-01",
          note: "メモ",
        }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.estimatedMinutes).toBeDefined();
        expect(result.errors.estimatedMinutes).toContain(
          "作業時間は1分以上で入力してください",
        );
      }
      expect(service.updateTask).not.toHaveBeenCalled();
    });

    it("estimatedMinutesが負の数の場合エラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await updateTaskAction(
        initialState,
        makeFormData({
          id: mockUpdatedTask.id,
          title: "テストタスク",
          estimatedMinutes: "-10",
          dueAt: "2026-02-01",
          note: "メモ",
        }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.estimatedMinutes).toBeDefined();
      }
      expect(service.updateTask).not.toHaveBeenCalled();
    });

    it("dueAtが無効な日付の場合エラーを返すこと", async () => {
      setupAuthenticatedUser();

      const result = await updateTaskAction(
        initialState,
        makeFormData({
          id: mockUpdatedTask.id,
          title: "テストタスク",
          estimatedMinutes: "30",
          dueAt: "invalid-date",
          note: "メモ",
        }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.dueAt).toBeDefined();
        expect(result.errors.dueAt).toContain("有効な日付を入力してください");
      }
      expect(service.updateTask).not.toHaveBeenCalled();
    });

    it("複数のフィールドに検証エラーがある場合全て返すこと", async () => {
      setupAuthenticatedUser();

      const result = await updateTaskAction(
        initialState,
        makeFormData({
          id: "invalid-uuid",
          title: "",
          estimatedMinutes: "-5",
          dueAt: "invalid-date",
          note: "メモ",
        }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.id).toBeDefined();
        expect(result.errors.title).toBeDefined();
        expect(result.errors.estimatedMinutes).toBeDefined();
        expect(result.errors.dueAt).toBeDefined();
      }
      expect(service.updateTask).not.toHaveBeenCalled();
    });
  });

  describe("異常系 - 認証エラー", () => {
    it("未認証ユーザの場合エラーを返すこと", async () => {
      setupUnauthenticatedUser();

      const result = await updateTaskAction(
        initialState,
        makeFormData({
          id: mockUpdatedTask.id,
          title: "テストタスク",
          estimatedMinutes: "30",
          dueAt: "2026-02-01",
          note: "メモ",
        }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toBeDefined();
        expect(result.errors._form).toContain(
          "タスクを更新するにはログインが必要です。",
        );
      }
      expect(service.updateTask).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe("異常系 - サービスエラー", () => {
    it("updateTaskが失敗した場合エラーを返すこと", async () => {
      setupAuthenticatedUser();
      vi.mocked(service.updateTask).mockRejectedValueOnce(
        new Error("Database error"),
      );

      const result = await updateTaskAction(
        initialState,
        makeFormData({
          id: mockUpdatedTask.id,
          title: "テストタスク",
          estimatedMinutes: "30",
          dueAt: "2026-02-01",
          note: "メモ",
        }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toBeDefined();
        expect(result.errors._form).toContain(
          "タスクの更新に失敗しました。時間をおいて再度お試しください。",
        );
      }
      expect(service.updateTask).toHaveBeenCalledTimes(1);
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("予期しないエラーが発生した場合エラーを返すこと", async () => {
      setupAuthenticatedUser();
      vi.mocked(service.updateTask).mockRejectedValueOnce(
        new Error("Unexpected error"),
      );

      const result = await updateTaskAction(
        initialState,
        makeFormData({
          id: mockUpdatedTask.id,
          title: "テストタスク",
          estimatedMinutes: "30",
          dueAt: "2026-02-01",
          note: "メモ",
        }),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._form).toBeDefined();
      }
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });
});
