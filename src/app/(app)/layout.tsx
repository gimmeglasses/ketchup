import DashboardHeader from "@/shared/components/app/DashboardHeader";
import DashboardFooter from "@/shared/components/app/DashboardFooter";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col min-h-screen bg-gray-200">
      <DashboardHeader />
      <div className="flex-1 pb-10 mx-auto max-w-5xl w-full px-4">
        {children}
      </div>
      <div className="mx-auto max-w-5xl w-full px-4">
        <DashboardFooter />
      </div>
      <Toaster position="top-right" />
    </main>
  );
}
