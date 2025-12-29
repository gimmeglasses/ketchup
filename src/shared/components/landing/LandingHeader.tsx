import Image from "next/image";
import Link from "next/link";

export const LandingHeader = () => {
  return (
    <header className="flex items-center justify-between py-4">
      <div className="flex items-center gap-2">
        <div className="relative h-9 w-24 sm:h-10 sm:w-28">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Ketchup Logo"
              fill
              className="object-contain drop-shadow-md"
              priority
            />
          </Link>
        </div>
        <span className="hidden text-xs font-semibold tracking-wide text-red-50/90 sm:inline">
          Pomodoro × Todo でキャッチアップ
        </span>
      </div>

      <nav className="flex items-center gap-3 text-xs sm:text-sm">
        <Link
          href="/auth/login"
          className="rounded-full px-3 py-1.5 font-semibold text-red-50/90 transition hover:bg-red-50/10"
        >
          ログイン
        </Link>
        <Link
          href="/auth/register"
          className="rounded-full bg-white px-3 py-1.5 font-semibold text-red-600 shadow-sm shadow-red-800/30 transition hover:-translate-y-0.5 hover:bg-yellow-100"
        >
          無料で始める
        </Link>
      </nav>
    </header>
  );
};
