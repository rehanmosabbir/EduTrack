"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { useTeacherDashboard } from "@/hooks/use-server-state";
import { formatDate, formatMarks } from "@/lib/format";

export default function TeacherDashboardPage() {
  const { data, isLoading, error } = useTeacherDashboard();

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (error || !data) {
    return <p className="text-sm text-red-600">Failed to load dashboard.</p>;
  }

  const upcoming = (data.upcomingDeadlines as Array<Record<string, unknown>>) ?? [];
  const recent = (data.recentEvaluations as Array<Record<string, unknown>>) ?? [];
  const notPrepared = (data.notPrepared as Array<Record<string, unknown>>) ?? [];

  return (
    <div>
      <PageHeader
        title="Teacher dashboard"
        description="Daily coaching overview"
        actions={
          <>
            <Button asChild>
              <Link href="/teacher/students">Add student</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/teacher/homework/new">Assign homework</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/teacher/evaluations/new">Record evaluation</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            ["Active students", Number(data.activeStudents ?? 0)],
            ["Today's homework", Number(data.todayHomework ?? 0)],
            ["Unanswered comments", Number(data.unansweredComments ?? 0)],
            ["Not prepared today", notPrepared.length],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Upcoming deadlines</h2>
          <ul className="mt-3 space-y-2">
            {upcoming.length === 0 ? (
              <li className="text-sm text-slate-500">No upcoming deadlines.</li>
            ) : (
              upcoming.map((h) => (
                <li
                  key={String(h.id)}
                  className="flex items-center justify-between gap-2 border-b border-slate-100 py-2 text-sm last:border-0"
                >
                  <span>
                    {(h.student as { fullName?: string })?.fullName} —{" "}
                    {String(h.title)}
                  </span>
                  <span className="text-slate-500">
                    {formatDate(h.dueDate as string)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Recent evaluations</h2>
          <ul className="mt-3 space-y-2">
            {recent.length === 0 ? (
              <li className="text-sm text-slate-500">No evaluations yet.</li>
            ) : (
              recent.map((e) => (
                <li
                  key={String(e.id)}
                  className="flex items-center justify-between gap-2 border-b border-slate-100 py-2 text-sm last:border-0"
                >
                  <span>
                    {(e.student as { fullName?: string })?.fullName} —{" "}
                    {(e.subject as { name?: string })?.name}
                  </span>
                  <span className="text-slate-500">
                    {formatMarks(
                      e.marksObtained as number | null,
                      e.maximumMarks as number | null,
                    )}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
