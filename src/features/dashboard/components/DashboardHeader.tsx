import Link from "next/link";
import Image from "next/image"

const DashboardHeader = () => {
  return (
    <header className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div className="relative h-9 w-24 sm:h-10 sm:w-28">
          {/* logo */}
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
      </div>

      <nav className="flex items-center gap-3 text-xs sm:text-sm font-bold text-gray-600">
        <Link href='/'>
          <span>マイページ</span>
        </Link>
      </nav>
    </header>
  );
};

export default DashboardHeader;