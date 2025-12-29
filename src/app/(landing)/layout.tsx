import type { ReactNode } from "react";
import { LandingHeader } from "@/shared/components/landing/LandingHeader";
import { LandingFooter } from "@/shared/components/landing/LandingFooter";

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-linear-to-b from-red-500 via-red-400 to-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4">
        <LandingHeader />
        <div className="flex flex-1 flex-col items-center justify-center pb-10">
          {children}
        </div>
        <LandingFooter />
      </div>
    </main>
  );
}
