import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Logo */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-32 w-64 sm:h-40 sm:w-80">
          <Image
            src="/logo.png"
            alt="Ketchup Pomodoro Logo"
            fill
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>
      </div>

      {/* Hero Text */}
      <section className="mt-4 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-red-950 drop-shadow-sm sm:text-4xl md:text-5xl">
          集中もタスク管理も、
          <br className="hidden sm:block" />
          ぜんぶ <span className="text-white">Ketchup</span> におまかせ。
        </h1>
        <p className="mt-4 max-w-xl text-balance text-base text-red-950/80 sm:text-lg">
          ポモドーロタイマーと、Todoリストをひとつの画面に。
          学習も開発も、ポモドーロで遅れをキャッチアップ。
        </p>
      </section>

      {/* CTA Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/auth/register"
          className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-red-600 shadow-lg shadow-red-700/30 transition hover:-translate-y-0.5 hover:bg-yellow-100 hover:shadow-xl"
        >
          無料で会員登録
        </Link>
        <Link
          href="/auth/login"
          className="rounded-full border border-white/70 bg-red-500/80 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-red-800/40 transition hover:-translate-y-0.5 hover:bg-red-600"
        >
          ログイン
        </Link>
      </div>

      {/* Feature teaser */}
      <div className="mt-10 grid w-full max-w-3xl gap-4 text-sm text-red-950/80 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/80 p-4 shadow-md shadow-red-200">
          <h2 className="text-base font-bold text-red-700">
            ポモドーロタイマー
          </h2>
          <p className="mt-1">
            25分集中＋5分休憩のサイクルをワンクリックで開始。カスタム時間にも対応予定。
          </p>
        </div>
        <div className="rounded-2xl bg-white/80 p-4 shadow-md shadow-red-200">
          <h2 className="text-base font-bold text-red-700">Todoリスト連動</h2>
          <p className="mt-1">
            タスクと一緒にタイマーを起動して、そのポモドーロで何をやるかを明確にできる。
          </p>
        </div>
      </div>
    </>
  );
}
