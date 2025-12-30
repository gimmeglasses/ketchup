"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ConfirmContent() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/auth/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-xl shadow-red-200">
      <h1 className="text-center text-2xl font-bold text-red-800">
        メール確認が完了しました
      </h1>
      <p className="mt-2 text-center text-sm text-red-900/70">
        アカウントの本登録が完了しました。
      </p>

      <div className="mt-6 space-y-3 text-sm text-red-900">
        <p>
          5秒後にログイン画面へ自動的に移動します。
          すぐに移動したい場合は、下のボタンをクリックしてください。
        </p>
      </div>

      <div className="mt-6">
        <Link
          href="/auth/login"
          className="block w-full rounded-full bg-red-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-red-700/40 transition hover:-translate-y-0.5 hover:bg-red-700"
        >
          ログイン画面へ進む
        </Link>
      </div>
    </div>
  );
}
