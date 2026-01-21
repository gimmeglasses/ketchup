import { z } from "zod";

const emptyToNull = (val: unknown) => (val === "" || val === null ? null : val);

const estimateMinuteSchema = z.preprocess(
  emptyToNull,
  z
    .union([z.string(), z.number()])
    .nullable()
    .transform((val) => {
      if (val === null) return null;
      const num = typeof val === "number" ? val : Number(val);
      return num;
    })

    .refine((val) => val === null || Number.isInteger(val), {
      message: "作業時間は有効な整数で入力してください",
    })

    .refine((val) => val === null || val >= 1, {
      message: "作業時間は1分以上で入力してください",
    }),
);

const dueAtSchema = z.preprocess(
  emptyToNull,
  z
    .string()
    .nullable()
    .refine(
      (val) => {
        if (val === null) return null;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      {
        message: "有効な日付を入力してください",
      },
    ),
);

const noteSchema = z.preprocess(emptyToNull, z.string().nullable());

export const updateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z
    .string()
    .trim()
    .min(1, "タイトルを入力してください")
    .max(255, "タイトルは255文字以内で入力してください"),
  estimatedMinutes: estimateMinuteSchema,
  dueAt: dueAtSchema,
  note: noteSchema,
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
