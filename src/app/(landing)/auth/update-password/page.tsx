import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/features/auth/components/UpdatePasswordForm";

export const metadata: Metadata = {
  title: "パスワードの更新",
  description: "新しいパスワードを設定します。",
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />;
}
