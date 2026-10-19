"use client";

import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/ui/page-header";
import { useStudentDashboard } from "@/hooks/use-server-state";
import { formatDate, formatMarks } from "@/lib/format";

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const { data, isLoading } = useStudentDashboard(
    session?.user?.studentId ?? undefined,
  );

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (!data) return <p className="text-sm text-red-600">Unable to load dashboard.</p>;

  const student = data.student as { fullName?: string; className?: string } | null;
  const todayHomework = (data.todayHomework as Array<Record<string, unknown>>) ?? [];
  const upcoming = (data.upcoming as Array<Record<string, unknown>>) ?? [];
  const todayEvals = (data.todayEvals as Array<Record<string, unknown>>) ?? [];
  const progress = data.progress as {
    overall?: { percentage: number | null; evaluationCount: number };
    subjects?: Array<{ subjectName: string; percentage: number | null }>;
  };

  return (
    <div>
      <PageHeader
        title={`Hello, ${student?.fullName ?? "Student"}`}
        description={`${student?.className ?? ""} · Read-only academic view`}
      />
      <div className="mb-4 rounded-xl border bg-white p-4 text-sm">
        Overall weighted percentage:{" "}
        <strong>
          {progress?.overall?.percentage == null
            ? "No recorded marks yet"
            : `${progress.overall.percentage}% (${progress.overall.evaluationCount} evaluations)`}
        </strong>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Today&apos;s homework</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {todayHomework.length === 0 ? (
              <li className="text-slate-500">No homework assigned today.</li>
            ) : (
              todayHomework.map((h) => (
                <li key={String(h.id)}>
                  {(h.subject as { name?: string })?.name}: {String(h.title)}
                </li>
              ))
            )}
          </ul>
        </section>
        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Upcoming due dates</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {upcoming.length === 0 ? (
              <li className="text-slate-500">No upcoming deadlines.</li>
            ) : (
              upcoming.map((h) => (
                <li key={String(h.id)} className="flex justify-between gap-2">
                  <span>{String(h.title)}</span>
                  <span className="text-slate-500">
                    {formatDate(h.dueDate as string)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
        <section className="rounded-xl border bg-white p-4 lg:col-span-2">
          <h2 className="font-semibold">Today&apos;s evaluations</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {todayEvals.length === 0 ? (
              <li className="text-slate-500">No evaluations recorded today.</li>
            ) : (
              todayEvals.map((e) => (
                <li key={String(e.id)} className="flex justify-between gap-2">
                  <span>
                    {(e.subject as { name?: string })?.name} —{" "}
                    {String(e.lessonOrChapter)}
                  </span>
                  <span>
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
