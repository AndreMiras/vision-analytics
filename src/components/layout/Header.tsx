"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Clock,
  LineChart,
  Lock,
  LucideIcon,
  Menu,
  PieChart,
  TrendingUp,
  X,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

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

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="border-b bg-blue-100 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={closeMobileMenu}
            >
              <LineChart size={20} className="text-blue-500" />
              <span className="hidden sm:inline">
                Bitpanda Vision Analytics
              </span>
              <span className="sm:hidden">Vision Analytics</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap"
                >
                  <Icon size={16} />
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="xl:hidden">{item.label.split(" ")[0]}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side - GitHub + Mobile menu button */}
          <div className="flex items-center gap-2">
            {/* GitHub link - always visible but responsive text */}
            <Link
              href="https://github.com/AndreMiras/vision-analytics"
              target="_blank"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-500 transition-colors"
            >
              <FaGithub size={16} />
              <span className="hidden sm:inline">About</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-blue-200 bg-blue-50">
            <nav className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
