import { z } from "zod";

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .max(254, "メールアドレスは254文字以内で入力してください")
    .email("有効なメールアドレスを入力してください"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
