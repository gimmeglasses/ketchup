import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "ログイン",
  description: "Ketchupアカウントにログインするページです。",
};

export default function LoginPage() {
  return <LoginForm />;
}
