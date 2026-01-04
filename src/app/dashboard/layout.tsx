import type { Metadata } from "next";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard to display a task list"
}

export default function DashboardLayout({
   children 
  }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-gray-200">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4">
        <DashboardHeader />
        <div className="flex flex-1 flex-col items-center justify-center pb-10">
          {children}
        </div>
      </div>
    </main>
  )
};