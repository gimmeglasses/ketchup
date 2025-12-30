import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "仮登録完了",
  description: "メールアドレスの確認を行うための案内ページです。",
};

export default function RegisterSuccessPage() {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-xl shadow-red-200">
      <h1 className="text-center text-2xl font-bold text-red-800">
        仮登録が完了しました
      </h1>
      <p className="mt-2 text-center text-sm text-red-900/70">
        ご入力いただいたメールアドレスに確認メールを送信しました
        <br />
        メール内のリンクをクリックして本登録を完了してください。
      </p>

      <div className="mt-6 space-y-3 text-sm text-red-900">
        <p className="text-xs text-red-900/70">
          メールが届かない場合は、迷惑メールフォルダをご確認のうえ、
          数分待ってから再度お試しください。
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <Link
          href="/auth/login"
          className="block w-full rounded-full bg-red-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-red-700/40 transition hover:-translate-y-0.5 hover:bg-red-700"
        >
          ログイン画面へ戻る
        </Link>

        <p className="text-center text-xs text-red-900/70">
          誤ったメールアドレスを入力してしまった場合は、{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-red-700 underline-offset-2 hover:underline"
          >
            新規登録ページ
          </Link>
          から再度登録してください。
        </p>
      </div>
    </div>
  );
}
