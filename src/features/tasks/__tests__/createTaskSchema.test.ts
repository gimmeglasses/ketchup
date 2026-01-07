import { describe, expect, it } from "vitest";
import {
  createTaskSchema,
  type CreateTaskInput,
} from "../validations/createTaskSchema";

describe("createTaskSchema", () => {
  describe("title", () => {
    it("有効なタイトルで成功すること", () => {
      const input: CreateTaskInput = { title: "タスク名" };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("タスク名");
      }
    });

    it("タイトルが空の場合はエラーになること", () => {
      const input = { title: "" };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toContain(
          "タイトルを入力してください"
        );
      }
    });

    it("タイトルがスペースのみの場合はエラーになること", () => {
      const input = { title: "   " };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toContain(
          "タイトルを入力してください"
        );
      }
    });

    it("タイトルの前後のスペースがトリムされること", () => {
      const input = { title: "  タスク名  " };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("タスク名");
      }
    });

    it("タイトルが255文字の場合は成功すること", () => {
      const input = { title: "あ".repeat(255) };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it("タイトルが256文字以上の場合はエラーになること", () => {
      const input = { title: "あ".repeat(256) };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toContain(
          "タイトルは255文字以内で入力してください"
        );
      }
    });
  });

  describe("estimatedMinutes", () => {
    it("未指定の場合はundefinedになること", () => {
      const input = { title: "タスク名" };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.estimatedMinutes).toBeUndefined();
      }
    });

    it("空文字の場合はundefinedになること", () => {
      const input = { title: "タスク名", estimatedMinutes: "" };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.estimatedMinutes).toBeUndefined();
      }
    });

    it("正の整数の場合は成功すること", () => {
      const input = { title: "タスク名", estimatedMinutes: "30" };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.estimatedMinutes).toBe(30);
      }
    });

    it("数値型でも受け付けること", () => {
      const input = { title: "タスク名", estimatedMinutes: 60 };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.estimatedMinutes).toBe(60);
      }
    });

    it("0の場合はエラーになること", () => {
      const input = { title: "タスク名", estimatedMinutes: "0" };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.estimatedMinutes).toContain(
          "作業時間は1分以上で入力してください"
        );
      }
    });

    it("負の数の場合はエラーになること", () => {
      const input = { title: "タスク名", estimatedMinutes: "-10" };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.estimatedMinutes).toContain(
          "作業時間は1分以上で入力してください"
        );
      }
    });

    it("小数の場合はエラーになること", () => {
      const input = { title: "タスク名", estimatedMinutes: "30.5" };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.estimatedMinutes).toContain(
          "作業時間は整数で入力してください"
        );
      }
    });

    it("数値以外の文字列の場合はエラーになること", () => {
      const input = { title: "タスク名", estimatedMinutes: "abc" };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(false);
    });
  });

  describe("dueAt", () => {
    it("未指定の場合はundefinedになること", () => {
      const input = { title: "タスク名" };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dueAt).toBeUndefined();
      }
    });

    it("空文字の場合はundefinedになること", () => {
      const input = { title: "タスク名", dueAt: "" };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dueAt).toBeUndefined();
      }
    });

    it("有効なISO8601形式の日付で成功すること", () => {
      const input = { title: "タスク名", dueAt: "2030-12-31T23:59:59.000Z" };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dueAt).toBe("2030-12-31T23:59:59.000Z");
      }
    });

    it("過去の日付も許容されること", () => {
      const input = { title: "タスク名", dueAt: "2020-01-01T00:00:00.000Z" };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
    });

    it("無効な日付形式の場合はエラーになること", () => {
      const input = { title: "タスク名", dueAt: "invalid-date" };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.dueAt).toContain(
          "有効な日付を入力してください"
        );
      }
    });

    it("日付のみの形式でも成功すること", () => {
      const input = { title: "タスク名", dueAt: "2030-12-31" };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
    });
  });

  describe("note", () => {
    it("未指定の場合はundefinedになること", () => {
      const input = { title: "タスク名" };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.note).toBeUndefined();
      }
    });

    it("空文字の場合はundefinedになること", () => {
      const input = { title: "タスク名", note: "" };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.note).toBeUndefined();
      }
    });

    it("有効なメモで成功すること", () => {
      const input = { title: "タスク名", note: "これはメモです" };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.note).toBe("これはメモです");
      }
    });

    it("長いメモも許容されること", () => {
      const input = { title: "タスク名", note: "あ".repeat(10000) };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
    });
  });

  describe("複合テスト", () => {
    it("全フィールドが有効な場合に成功すること", () => {
      const input: CreateTaskInput = {
        title: "タスク名",
        estimatedMinutes: 30,
        dueAt: "2030-12-31T23:59:59.000Z",
        note: "メモ",
      };
      const result = createTaskSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          title: "タスク名",
          estimatedMinutes: 30,
          dueAt: "2030-12-31T23:59:59.000Z",
          note: "メモ",
        });
      }
    });
  });
});
