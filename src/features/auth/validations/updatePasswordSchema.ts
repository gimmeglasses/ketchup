import { z } from "zod";

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8, "パスワードは8文字以上で入力してください"),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "パスワードが一致しません",
    path: ["passwordConfirmation"],
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
