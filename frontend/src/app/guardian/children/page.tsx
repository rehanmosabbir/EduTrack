"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { useGuardianDashboard } from "@/hooks/use-server-state";

export default function GuardianChildrenPage() {
  const { data, isLoading } = useGuardianDashboard();
  const children =
    (data?.children as Array<{
      id: string;
      fullName: string;
      studentCode: string;
      className: string;
      status: string;
    }>) ?? [];

  return (
    <div>
      <PageHeader title="My children" description="Linked student profiles" />
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <ul className="space-y-2">
          {children.map((c) => (
            <li key={c.id} className="rounded-xl border bg-white p-4 text-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{c.fullName}</p>
                  <p className="text-slate-500">
                    {c.studentCode} · {c.className} · {c.status}
                  </p>
                </div>
                <Link
                  className="text-teal-700 hover:underline"
                  href={`/guardian/children/${c.id}/progress`}
                >
                  Progress
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
