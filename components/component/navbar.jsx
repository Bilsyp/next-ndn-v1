import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SheetTrigger, SheetContent, Sheet } from "@/components/ui/sheet";

export function Navbar() {
  return (
    <header className="flex h-16 w-full items-center justify-between bg-white px-4 shadow-sm md:px-6">
      <Link className="flex items-center gap-2" href="#">
        <MountainIcon className="h-6 w-6" />
        <span className="text-lg font-semibold">Bilsyp</span>
      </Link>
      <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
        <Link
          className="transition-colors hover:text-gray-600 focus:text-gray-600"
          href="/"
        >
          Home
        </Link>{" "}
        <Link
          className="transition-colors hover:text-gray-600 focus:text-gray-600"
          href="/chat"
        >
          AI Chat
        </Link>
        <Link
          className="transition-colors hover:text-gray-600 focus:text-gray-600"
          href="/about"
        >
          About
        </Link>
        <Link
          className="transition-colors hover:text-gray-600 focus:text-gray-600"
          href="/stream"
        >
          Streaming
        </Link>
        <Link
          className="transition-colors hover:text-gray-600 focus:text-gray-600"
          href="/stats"
        >
          Statistic
        </Link>
        <Link
          className="transition-colors hover:text-gray-600 focus:text-gray-600"
          href="/blog"
        >
          Blog
        </Link>
        <Link
          className="transition-colors hover:text-gray-600 focus:text-gray-600"
          href="/topologi"
        >
          Topologi
        </Link>
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button className="md:hidden" size="icon" variant="outline">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <div className="grid gap-4 p-4">
            <Link
              className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus:bg-gray-100"
              href="/"
            >
              Home
              <ChevronRightIcon className="h-5 w-5" />
            </Link>
            <Link
              className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus:bg-gray-100"
              href="/about"
            >
              About
              <ChevronRightIcon className="h-5 w-5" />
            </Link>
            <Link
              className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus:bg-gray-100"
              href="/chat"
            >
              AI Chat
              <ChevronRightIcon className="h-5 w-5" />
            </Link>
            <Link
              className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus:bg-gray-100"
              href="/stream"
            >
              Streaming
              <ChevronRightIcon className="h-5 w-5" />
            </Link>
            <Link
              className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus:bg-gray-100"
              href="/stats"
            >
              Statistic
              <ChevronRightIcon className="h-5 w-5" />
            </Link>
            <Link
              className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus:bg-gray-100"
              href="/blog"
            >
              Blog
              <ChevronRightIcon className="h-5 w-5" />
            </Link>
            <Link
              className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus:bg-gray-100"
              href="/topologi"
            >
              Topologi
              <ChevronRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

function ChevronRightIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function MenuIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function MountainIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}
