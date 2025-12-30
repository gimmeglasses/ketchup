import Link from "next/link";

export const LandingFooter = () => {
  return (
    <footer className="border-t border-red-100/60 py-4">
      <div className="flex items-center justify-between text-xs text-red-900/70">
        <span>© {new Date().getFullYear()} Ketchup</span>
        <div className="flex gap-3">
          <Link href="/terms" className="hover:underline">
            利用規約
          </Link>
          <Link href="/privacy" className="hover:underline">
            プライバシー
          </Link>
        </div>
      </div>
    </footer>
  );
};
