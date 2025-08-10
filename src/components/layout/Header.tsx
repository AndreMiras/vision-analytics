import Link from "next/link";
import { Github, LineChart } from "lucide-react";

export const Header = () => (
  <header className="border-b bg-blue-100">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        <div className="flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <LineChart size={20} className="text-blue-500" />
            Bitpanda Vision Analytics
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="https://github.com/AndreMiras/vision-analytics"
            target="_blank"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-500 transition-colors"
          >
            <Github size={16} />
            About
          </Link>
        </nav>
      </div>
    </div>
  </header>
);
