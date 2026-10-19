"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  MessageSquare,
  Settings,
  Menu,
  X,
  LogOut,
  GraduationCap,
  History,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const teacherNav = [
  { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/students", label: "Students", icon: Users },
  { href: "/teacher/subjects", label: "Subjects", icon: BookOpen },
  { href: "/teacher/homework", label: "Homework", icon: ClipboardList },
  { href: "/teacher/evaluations", label: "Evaluations", icon: BarChart3 },
  { href: "/teacher/progress", label: "Progress", icon: History },
  { href: "/teacher/guardians", label: "Guardians", icon: UserCircle },
  { href: "/teacher/comments", label: "Comments", icon: MessageSquare },
  { href: "/teacher/settings", label: "Settings", icon: Settings },
];

const studentNav = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/homework", label: "Homework", icon: ClipboardList },
  { href: "/student/progress", label: "Progress", icon: BarChart3 },
  { href: "/student/history", label: "History", icon: History },
];

const guardianNav = [
  { href: "/guardian/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/guardian/children", label: "Children", icon: Users },
  { href: "/guardian/homework", label: "Homework", icon: ClipboardList },
  { href: "/guardian/comments", label: "Comments", icon: MessageSquare },
];

const labels = {
  teacher: "Teacher Console",
  student: "Student Portal",
  guardian: "Guardian Portal",
} as const;

export function AppShell({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "teacher" | "student" | "guardian";
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUiStore();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const nav =
    variant === "teacher"
      ? teacherNav
      : variant === "student"
        ? studentNav
        : guardianNav;

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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">EduTrack</p>
              <p className="text-xs text-slate-500">{labels[variant]}</p>
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
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-teal-50 text-teal-800"
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
                onClick={() => setSignOutOpen(true)}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>

      <ConfirmDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title="Sign out"
        description="Are you sure you want to sign out?"
        confirmLabel="Sign out"
        onConfirm={() => signOut({ callbackUrl: "/login" })}
      />
    </div>
  );
}
