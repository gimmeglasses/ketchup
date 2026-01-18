/**
 * getAllTasksPomodoroMinutesAction のテストスイート
 * actionがサービスを正しく呼び出すことを確認
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { type SupabaseClient } from "@supabase/supabase-js";
import { getAllTasksPomodoroMinutesAction } from "@/features/pomodoro/actions/getAllTasksPomodoroMinutesAction";
import * as service from "@/features/pomodoro/services/getAllTasksPomodoroMinutes";
import * as supabaseServer from "@/lib/supabase/server";

// getAllTasksPomodoroMinutesサービスをスパイ化
vi.spyOn(service, "getAllTasksPomodoroMinutes").mockResolvedValue({});

// Supabase クライアントをモック化
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("getAllTasksPomodoroMinutesAction", () => {
  it("認証されたユーザーでgetAllTasksPomodoroMinutesサービスを呼び出すこと", async () => {
    const mockUser = { id: "test-user-id" };
    const mockSupabase: Partial<SupabaseClient> = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      } as Partial<SupabaseClient["auth"]> as SupabaseClient["auth"],
    };

    vi.mocked(supabaseServer.createSupabaseServerClient).mockResolvedValue(
      mockSupabase as SupabaseClient
    );
    vi.mocked(service.getAllTasksPomodoroMinutes).mockResolvedValue({});

    await getAllTasksPomodoroMinutesAction();

    expect(service.getAllTasksPomodoroMinutes).toHaveBeenCalledTimes(1);
    expect(service.getAllTasksPomodoroMinutes).toHaveBeenCalledWith(
      "test-user-id"
    );
  });

  it("getAllTasksPomodoroMinutes が例外を投げた場合に例外を再スローすること", async () => {
    const mockUser = { id: "test-user-id" };
    const mockSupabase: Partial<SupabaseClient> = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      } as Partial<SupabaseClient["auth"]> as SupabaseClient["auth"],
    };

    vi.mocked(supabaseServer.createSupabaseServerClient).mockResolvedValue(
      mockSupabase as SupabaseClient
    );
    vi.mocked(service.getAllTasksPomodoroMinutes).mockRejectedValue(
      new Error("DB connection failed")
    );

    await expect(getAllTasksPomodoroMinutesAction()).rejects.toThrow(
      "DB connection failed"
    );
    expect(service.getAllTasksPomodoroMinutes).toHaveBeenCalledTimes(1);
    expect(service.getAllTasksPomodoroMinutes).toHaveBeenCalledWith(
      "test-user-id"
    );
  });

  it("未認証の場合はエラーをスローすること", async () => {
    const mockSupabase: Partial<SupabaseClient> = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      } as Partial<SupabaseClient["auth"]> as SupabaseClient["auth"],
    };

    vi.mocked(supabaseServer.createSupabaseServerClient).mockResolvedValue(
      mockSupabase as SupabaseClient
    );

    await expect(getAllTasksPomodoroMinutesAction()).rejects.toThrow(
      "ポモドーロ実績を取得するにはユーザー認証が必要です。"
    );
    expect(service.getAllTasksPomodoroMinutes).not.toHaveBeenCalled();
  });

  it("Supabase クライアント生成が失敗した場合に例外を再スローすること", async () => {
    vi.mocked(supabaseServer.createSupabaseServerClient).mockRejectedValue(
      new Error("supabase down")
    );

    await expect(getAllTasksPomodoroMinutesAction()).rejects.toThrow(
      "supabase down"
    );
    expect(service.getAllTasksPomodoroMinutes).not.toHaveBeenCalled();
  });
});
