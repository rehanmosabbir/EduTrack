import { AppShell } from "@/components/layout/app-shell";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell variant="teacher">{children}</AppShell>;
}
