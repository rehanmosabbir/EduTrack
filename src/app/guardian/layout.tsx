import { AppShell } from "@/components/layout/app-shell";

export default function GuardianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell variant="guardian">{children}</AppShell>;
}
