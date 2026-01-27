import { describe, it, expect } from "vitest";
import { updateTaskSchema } from "../validations/updateTaskSchema";

describe("updateTaskSchema", () => {
  describe("id validation", () => {
    it("有効なUUIDを受け入れる", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: "30",
        dueAt: "2026-02-01",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("無効なUUID形式を拒否する", () => {
      const input = {
        id: "invalid-uuid",
        title: "テストタスク",
        estimatedMinutes: "30",
        dueAt: "2026-02-01",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(["id"]);
      }
    });

    it("UUID v4形式を受け入れる", () => {
      const input = {
        id: "123e4567-e89b-42d3-a456-426614174000",
        title: "テストタスク",
        estimatedMinutes: "30",
        dueAt: "2026-02-01",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("title validation", () => {
    it("有効なタイトルを受け入れる", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "有効なタスクタイトル",
        estimatedMinutes: "30",
        dueAt: "2026-02-01",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("空のタイトルを拒否する", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "",
        estimatedMinutes: "30",
        dueAt: "2026-02-01",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(["title"]);
        expect(result.error.issues[0].message).toBe(
          "タイトルを入力してください",
        );
      }
    });

    it("スペースのみのタイトルを拒否する", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "   ",
        estimatedMinutes: "30",
        dueAt: "2026-02-01",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(["title"]);
      }
    });

    it("255文字のタイトルを受け入れる", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "a".repeat(255),
        estimatedMinutes: "30",
        dueAt: "2026-02-01",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("256文字以上のタイトルを拒否する", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "a".repeat(256),
        estimatedMinutes: "30",
        dueAt: "2026-02-01",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(["title"]);
        expect(result.error.issues[0].message).toBe(
          "タイトルは255文字以内で入力してください",
        );
      }
    });
  });

  describe("estimatedMinutes validation", () => {
    it("有効な数値文字列を受け入れる", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: "30",
        dueAt: "2026-02-01",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.estimatedMinutes).toBe(30);
      }
    });

    it("数値型を受け入れて数値に変換する", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: 45,
        dueAt: "2026-02-01",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.estimatedMinutes).toBe(45);
      }
    });

    it("空文字列をnullに変換する", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: "",
        dueAt: "2026-02-01",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.estimatedMinutes).toBeNull();
      }
    });

    it("nullを受け入れる", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: null,
        dueAt: "2026-02-01",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.estimatedMinutes).toBeNull();
      }
    });

    it("小数を拒否する", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: "30.5",
        dueAt: "2026-02-01",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(["estimatedMinutes"]);
        expect(result.error.issues[0].message).toBe(
          "作業時間は有効な整数で入力してください",
        );
      }
    });

    it("0を拒否する", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: "0",
        dueAt: "2026-02-01",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(["estimatedMinutes"]);
        expect(result.error.issues[0].message).toBe(
          "作業時間は1分以上で入力してください",
        );
      }
    });

    it("負の数を拒否する", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: "-10",
        dueAt: "2026-02-01",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(["estimatedMinutes"]);
      }
    });

    it("1分を受け入れる", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: "1",
        dueAt: "2026-02-01",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.estimatedMinutes).toBe(1);
      }
    });

    it("大きな数値を受け入れる", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: "9999",
        dueAt: "2026-02-01",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.estimatedMinutes).toBe(9999);
      }
    });
  });

  describe("dueAt validation", () => {
    it("有効な日付文字列を受け入れる", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: "30",
        dueAt: "2026-02-01",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dueAt).toBe("2026-02-01");
      }
    });

    it("空文字列をnullに変換する", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: "30",
        dueAt: "",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dueAt).toBeNull();
      }
    });

    it("nullを受け入れる", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: "30",
        dueAt: null,
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dueAt).toBeNull();
      }
    });

    it("無効な日付文字列を拒否する", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: "30",
        dueAt: "invalid-date",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(["dueAt"]);
        expect(result.error.issues[0].message).toBe(
          "有効な日付を入力してください",
        );
      }
    });

    it("ISO 8601形式の日付を受け入れる", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: "30",
        dueAt: "2026-12-31T23:59:59Z",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("note validation", () => {
    it("有効な文字列を受け入れる", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: "30",
        dueAt: "2026-02-01",
        note: "これはメモです",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.note).toBe("これはメモです");
      }
    });

    it("空文字列をnullに変換する", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: "30",
        dueAt: "2026-02-01",
        note: "",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.note).toBeNull();
      }
    });

    it("nullを受け入れる", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: "30",
        dueAt: "2026-02-01",
        note: null,
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.note).toBeNull();
      }
    });

    it("長い文字列を受け入れる", () => {
      const longNote = "あ".repeat(1000);
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "テストタスク",
        estimatedMinutes: "30",
        dueAt: "2026-02-01",
        note: longNote,
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.note).toBe(longNote);
      }
    });
  });

  describe("complete validation", () => {
    it("全ての必須フィールドとオプションフィールドを含む有効なデータを受け入れる", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "完全なタスク",
        estimatedMinutes: "60",
        dueAt: "2026-03-15",
        note: "詳細なメモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          id: "550e8400-e29b-41d4-a716-446655440000",
          title: "完全なタスク",
          estimatedMinutes: 60,
          dueAt: "2026-03-15",
          note: "詳細なメモ",
        });
      }
    });

    it("オプションフィールドがnullの場合でも受け入れる", () => {
      const input = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "最小限のタスク",
        estimatedMinutes: null,
        dueAt: null,
        note: null,
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          id: "550e8400-e29b-41d4-a716-446655440000",
          title: "最小限のタスク",
          estimatedMinutes: null,
          dueAt: null,
          note: null,
        });
      }
    });

    it("複数のフィールドエラーを同時に報告する", () => {
      const input = {
        id: "invalid-uuid",
        title: "",
        estimatedMinutes: "-5",
        dueAt: "invalid-date",
        note: "メモ",
      };

      const result = updateTaskSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(1);
      }
    });
  });
});
