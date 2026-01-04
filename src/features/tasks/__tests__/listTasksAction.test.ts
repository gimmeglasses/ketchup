/**
 * listTasksAction のテストスイート
 * actionがサービスを正しく呼び出すことを確認
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { listTasksAction } from "@/features/tasks/actions/listTasksAction";
import * as service from "@/features/tasks/services/listTasks";
import * as supabaseServer from "@/lib/supabase/server";

// listTasksサービスをスパイ化
vi.spyOn(service, "listTasks").mockResolvedValue([]);

// Supabase クライアントをモック化
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("listTasksAction", () => {
  it("認証されたユーザーでlistTasksサービスを呼び出すこと", async () => {
    const mockUser = { id: "test-user-id" };
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    };

    vi.mocked(supabaseServer.createSupabaseServerClient).mockResolvedValue(
      mockSupabase
    );
    vi.mocked(service.listTasks).mockResolvedValue([]);

    await listTasksAction();

    expect(service.listTasks).toHaveBeenCalledTimes(1);
    expect(service.listTasks).toHaveBeenCalledWith("test-user-id");
  });

  it("listTasks が例外を投げた場合に例外を再スローすること", async () => {
    const mockUser = { id: "test-user-id" };
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    };

    vi.mocked(supabaseServer.createSupabaseServerClient).mockResolvedValue(
      mockSupabase
    );
    vi.mocked(service.listTasks).mockRejectedValue(
      new Error("DB connection failed")
    );

    await expect(listTasksAction()).rejects.toThrow("DB connection failed");
    expect(service.listTasks).toHaveBeenCalledTimes(1);
    expect(service.listTasks).toHaveBeenCalledWith("test-user-id");
  });

  it("未認証の場合はエラーをスローすること", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    };

    vi.mocked(supabaseServer.createSupabaseServerClient).mockResolvedValue(
      mockSupabase
    );

    await expect(listTasksAction()).rejects.toThrow(
      "タスクの一覧を表示するにはユーザー認証が必要です。"
    );
    expect(service.listTasks).not.toHaveBeenCalled();
  });

  it("Supabase クライアント生成が失敗した場合に例外を再スローすること", async () => {
    vi.mocked(supabaseServer.createSupabaseServerClient).mockRejectedValue(
      new Error("supabase down")
    );

    await expect(listTasksAction()).rejects.toThrow("supabase down");
    expect(service.listTasks).not.toHaveBeenCalled();
  });
});
