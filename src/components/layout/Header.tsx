import Link from "next/link";
import {
  Clock,
  Github,
  LineChart,
  Lock,
  LucideIcon,
  PieChart,
  TrendingUp,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navigationItems: NavItem[] = [
  {
    href: "/",
    label: "Performance",
    icon: TrendingUp,
  },
  {
    href: "/tvl",
    label: "Total Value Locked",
    icon: Lock,
  },
  {
    href: "/staking-overview",
    label: "Staking Overview",
    icon: PieChart,
  },
  {
    href: "/unstaking",
    label: "Pending Unstaking",
    icon: Clock,
  },
];

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
        {/* Main Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {/* Right side nav */}
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
