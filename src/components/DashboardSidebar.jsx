"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "@/ThemeProvider";
import {
  ChartBarIcon,
  DocumentTextIcon,
  PhotoIcon,
  ChartPieIcon,
  BookmarkIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  PencilSquareIcon,
  UserCircleIcon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { user } = useUser();
  const fullName = user?.fullName || "No Name";
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { href: "/dashboard", name: "Overview", icon: ChartBarIcon },
    { href: "/dashboard/create", name: "Create Blog", icon: PencilSquareIcon },
    { href: "/dashboard/gallery", name: "Image Gallery", icon: PhotoIcon },
    { href: "/dashboard/analytics", name: "Analytics", icon: ChartPieIcon },
    { href: "/dashboard/bookmarks", name: "Bookmarks", icon: BookmarkIcon },
    { href: "/dashboard/authors", name: "Authors", icon: UserGroupIcon },
    { href: "/dashboard/settings", name: "Settings", icon: Cog6ToothIcon },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed z-50 p-2 rounded-md m-2 ${
            theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800"
          } shadow-lg md:hidden`}
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 w-64 h-screen flex flex-col border-r transition-transform duration-300 ease-in-out ${
          isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
        } ${
          theme === "dark"
            ? "bg-gray-900 text-gray-100 border-gray-700"
            : "bg-white text-gray-900 border-gray-200"
        }`}
      >
        <div className="flex-1 flex flex-col overflow-y-auto pt-4">
          {/* Navigation Menu - moved to top since logo is removed */}
          <nav className="flex-1 space-y-1 px-2">
            {menuItems.map(({ href, name, icon: Icon }) => {
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => isMobile && setIsOpen(false)}
                  className={`flex items-center p-3 rounded-lg transition-all ${
                    isActive
                      ? theme === "dark"
                        ? "bg-blue-900/30 text-blue-400 font-semibold border-l-4 border-blue-500"
                        : "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500"
                      : theme === "dark"
                      ? "hover:bg-gray-800"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 mr-3 ${
                      isActive
                        ? theme === "dark"
                          ? "text-blue-400"
                          : "text-blue-500"
                        : theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  />
                  <span>{name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div
            className={`p-4 border-t ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-3">
              <UserCircleIcon
                className={`h-8 w-8 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <div>
                <p className="text-sm font-medium">{fullName}</p>
                <Link
                  href="/dashboard/settings"
                  className={`text-sm ${
                    theme === "dark"
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-800"
                  } hover:underline`}
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  View profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
