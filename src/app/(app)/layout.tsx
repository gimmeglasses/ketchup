import DashboardFooter from "@/shared/components/app/DashboardFooter";
import { Toaster } from "sonner";
import AppNav from "@/shared/components/app/AppNav";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-rose-50">
      {/* 背景装飾 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-rose-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* PC版: 上部ナビゲーション */}
      <div className="hidden md:block relative z-10">
        <AppNav />
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-10 relative z-10">
        <div className="mx-auto max-w-5xl w-full px-4 py-6">{children}</div>
      </div>

      {/* フッター（PC版のみ表示） */}
      <div className="hidden md:block relative z-10">
        <div className="mx-auto max-w-5xl w-full px-4 pb-6">
          <DashboardFooter />
        </div>
      </div>

      {/* モバイル版:  下部ナビゲーション */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <AppNav />
      </div>

      <Toaster position="top-right" />
    </main>
  );
}
