import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "パスワードリセット",
  description: "パスワードをリセットするためのメールを送信します。",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
