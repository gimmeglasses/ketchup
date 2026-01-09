import { z } from "zod";

const emptyToUndefined = (val: unknown) =>
  val === "" || val === null ? undefined : val;

const estimatedMinutesSchema = z.preprocess(
  emptyToUndefined,
  z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      const num = typeof val === "number" ? val : Number(val);
      return num;
    })
    .refine((val) => val === undefined || Number.isInteger(val), {
      message: "作業時間は有効な整数で入力してください",
    })
    .refine((val) => val === undefined || val >= 1, {
      message: "作業時間は1分以上で入力してください",
    })
);

const dueAtSchema = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .optional()
    .refine(
      (val) => {
        if (val === undefined) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: "有効な日付を入力してください" }
    )
);

const noteSchema = z.preprocess(emptyToUndefined, z.string().optional());

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "タイトルを入力してください")
    .max(255, "タイトルは255文字以内で入力してください"),
  estimatedMinutes: estimatedMinutesSchema.optional(),
  dueAt: dueAtSchema.optional(),
  note: noteSchema.optional(),
});

export type CreateTaskInput = z.output<typeof createTaskSchema>;
