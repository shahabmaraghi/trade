"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  BarChart2,
  CreditCard,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Search,
  Calendar,
  Users,
  UserRound,
  Sun,
  Moon,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function UserSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  const getUserInitial = () => {
    const name = user?.fullName?.trim();

    if (!name) return "ک";

    return name.charAt(0).toUpperCase();
  };

  const navItems = [
    {
      title: "داشبورد",
      href: "/user",
      icon: <LayoutDashboard className="h-5 w-5 ml-2" />,
    },
    {
      title: "تحلیل‌ها",
      href: "/user/analyses",
      icon: <BarChart2 className="h-5 w-5 ml-2" />,
    },
    {
      title: "بررسی پروژه‌ها",
      href: "/user/projects",
      icon: <Search className="h-5 w-5 ml-2" />,
    },
    {
      title: "مشاوره‌ها",
      href: "/user/reservations",
      icon: <Calendar className="h-5 w-5 ml-2" />,
    },
    {
      title: "لینک معرفی",
      href: "/user/referrals",
      icon: <Users className="h-5 w-5 ml-2" />,
    },
    {
      title: "اشتراک",
      href: "/user/subscription",
      icon: <CreditCard className="h-5 w-5 ml-2" />,
    },
    {
      title: "پشتیبانی",
      href: "/user/support",
      icon: <HelpCircle className="h-5 w-5 ml-2" />,
    },
    {
      title: "ورود به پنل ادمین",
      href: "/admin/dashboard",
     icon: <ShieldCheck className="h-5 w-5 ml-2" />,
    },
  ];

  const UserBottomMenu = () => (
    <div
      ref={userMenuRef}
      className="relative z-50 flex-shrink-0 flex border-t border-gray-700 p-4"
    >
      {isUserMenuOpen && (
        <div className="absolute bottom-full right-4 left-4 mb-3 overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 dark:bg-gray-900 shadow-2xl">
          <div className="border-b border-gray-700 p-4">
            <div className="flex items-center">
              <div className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                {getUserInitial()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {user?.fullName || "کاربر"}
                </p>
                <p className="truncate text-xs font-medium text-gray-400">
                  {user?.phone || "بدون شماره"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                setIsUserMenuOpen(false);
                router.push("/user/profile");
              }}
              className="flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <UserRound className="h-5 w-5 ml-2" />
              پروفایل
            </button>

            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 ml-2" />
              ) : (
                <Moon className="h-5 w-5 ml-2" />
              )}
              {theme === "dark" ? "حالت روشن" : "حالت تاریک"}
            </button>

            <button
              type="button"
              onClick={() => logout()}
              className="flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
            >
              <LogOut className="h-5 w-5 ml-2" />
              خروج
            </button>
          </div>
        </div>
      )}

      <div className="flex-shrink-0 w-full group block">
        <button
          type="button"
          onClick={() => setIsUserMenuOpen((prev) => !prev)}
          className="w-full text-right"
        >
          <div className="flex items-center">
            <div className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
              {getUserInitial()}
            </div>

            <div className="ml-3 min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {user?.fullName || "کاربر"}
              </p>
              <p className="truncate text-xs font-medium text-gray-400">
                {user?.phone || "بدون شماره"}
              </p>
            </div>

            <ChevronLeft
              className={cn(
                "mr-auto h-5 w-5 text-gray-400 transition-transform",
                isUserMenuOpen && "rotate-90",
              )}
            />
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="fixed top-3 right-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar for Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:inset-y-0 z-50">
        <div className="flex flex-col flex-grow bg-gray-800 dark:bg-gray-950 overflow-visible border-l border-gray-700">
          <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 border-b border-gray-700">
            <h1 className="text-xl font-bold text-white"> پلاس چارت </h1>
          </div>

          <div className="flex-grow flex flex-col min-h-0">
            <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === item.href ||
                      (pathname.startsWith(`${item.href}/`) &&
                        pathname === "/user")
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          <UserBottomMenu />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          <div className="relative flex flex-col w-full max-w-xs h-full bg-gray-800 dark:bg-gray-950 overflow-visible">
            <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 border-b border-gray-700">
              <h1 className="text-xl font-bold text-white mr-12">پلاس چارت</h1>
            </div>

            <div className="flex-grow flex flex-col min-h-0">
              <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors",
                      pathname === item.href ||
                        (pathname.startsWith(`${item.href}/`) &&
                          pathname === "/user")
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>

            <UserBottomMenu />
          </div>
        </div>
      )}
    </>
  );
}
