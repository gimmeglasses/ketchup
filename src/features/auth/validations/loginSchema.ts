import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .max(254, "メールアドレスは254文字以内で入力してください")
    .email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

export type LoginInput = z.infer<typeof loginSchema>;
