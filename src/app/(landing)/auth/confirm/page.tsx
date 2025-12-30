import type { Metadata } from "next";
import { ConfirmContent } from "@/features/auth/components/ConfirmContent";

export const metadata: Metadata = {
  title: "メール確認",
  description: "メールアドレス確認が完了したことをお知らせするページです。",
};

export default function ConfirmPage() {
  return <ConfirmContent />;
}
