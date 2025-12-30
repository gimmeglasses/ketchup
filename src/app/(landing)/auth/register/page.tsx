import { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "新規登録",
  description: "Ketchupアカウントを新規作成するページです。",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
