"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const AppNav = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "ダッシュボード", icon: "🏠" },
    { href: "/tasks", label: "タスク一覧", icon: "📝" },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-t border-red-100/60 shadow-lg md:bg-white/90 md:border-b md:border-t-0 md:shadow-sm">
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex items-center justify-around md:justify-start md:gap-8">
          {/* ロゴ（PC版のみ表示） */}
          <Link
            href="/dashboard"
            className="hidden md:flex items-center gap-2 py-3 group"
          >
            <div className="relative w-10 h-10 transition-transform duration-200 group-hover:scale-110">
              <Image
                src="/logo.png"
                alt="Ketchup Logo"
                fill
                className="object-contain drop-shadow-md"
                priority
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Ketchup
            </span>
          </Link>

          {/* ナビゲーションアイテム */}
          <div className="flex items-center justify-around md:justify-start md:gap-2 w-full md:w-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex flex-col items-center gap-1 px-6 py-3 text-xs font-medium transition-all duration-200 md:flex-row md:gap-2 md:text-sm md:px-5 md:py-4 group ${
                    isActive
                      ? "text-red-600"
                      : "text-gray-600 hover:text-red-500"
                  }`}
                >
                  {/* アクティブ時の背景 */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg md:rounded-none md:bg-none"></div>
                  )}

                  {/* アイコン */}
                  <span
                    className={`relative text-2xl md:text-base transition-transform duration-200 ${
                      isActive ? "scale-110" : "group-hover:scale-105"
                    }`}
                  >
                    {item.icon}
                  </span>

                  {/* ラベル */}
                  <span
                    className={`relative ${isActive ? "font-semibold" : ""}`}
                  >
                    {item.label}
                  </span>

                  {/* PC版: アクティブインジケーター */}
                  {isActive && (
                    <div className="hidden md:block absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-t-full"></div>
                  )}

                  {/* ホバー時のアンダーライン */}
                  {!isActive && (
                    <div className="hidden md:block absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-400 to-orange-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 rounded-t-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppNav;
