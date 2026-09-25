"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Clock,
  BarChart3,
  FileText,
  Target,
  Settings,
  Menu,
  X,
  LogOut,
  GraduationCap,
  LineChart,
  Calendar,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/button";

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { href: "/admin/study-progress", label: "Study Progress", icon: Clock },
  { href: "/admin/scores", label: "Scores", icon: BarChart3 },
  { href: "/admin/notes", label: "Notes", icon: FileText },
  { href: "/admin/goals", label: "Goals", icon: Target },
  { href: "/admin/reports", label: "Reports", icon: LineChart },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const studentNav = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/progress", label: "My Progress", icon: LineChart },
  { href: "/student/study-log", label: "Study Log", icon: Clock },
  { href: "/student/scores", label: "My Scores", icon: BarChart3 },
  { href: "/student/subjects", label: "Subjects", icon: BookOpen },
  { href: "/student/notes", label: "Notes", icon: FileText },
  { href: "/student/goals", label: "Goals", icon: Target },
  { href: "/student/calendar", label: "Calendar", icon: Calendar },
  { href: "/student/profile", label: "Profile", icon: User },
  { href: "/student/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "admin" | "student";
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUiStore();
  const nav = variant === "admin" ? adminNav : studentNav;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">EduTrack</p>
              <p className="text-xs text-slate-500">
                {variant === "admin" ? "Teacher Console" : "Student Portal"}
              </p>
            </div>
            <button
              className="ml-auto rounded-md p-1 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-1 p-3">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {sidebarOpen ? (
          <button
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close overlay"
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggleSidebar}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="ml-auto flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-slate-500">{session?.user?.role}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
