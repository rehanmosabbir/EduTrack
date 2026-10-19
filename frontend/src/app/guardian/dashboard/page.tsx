"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { useGuardianDashboard } from "@/hooks/use-server-state";
import { formatDate, formatMarks } from "@/lib/format";

export default function GuardianDashboardPage() {
  const [studentId, setStudentId] = useState<string | undefined>();
  const { data, isLoading } = useGuardianDashboard(studentId);

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (!data) return <p className="text-sm text-red-600">Unable to load dashboard.</p>;

  const children =
    (data.children as Array<{
      id: string;
      fullName: string;
      className: string;
    }>) ?? [];
  const selected = (data.selectedStudentId as string | null) ?? children[0]?.id;
  const dashboard = data.dashboard as Record<string, unknown> | null;
  const todayHomework =
    (dashboard?.todayHomework as Array<Record<string, unknown>>) ?? [];
  const todayEvals =
    (dashboard?.todayEvals as Array<Record<string, unknown>>) ?? [];
  const progress = dashboard?.progress as {
    overall?: { percentage: number | null; evaluationCount: number };
  };

  return (
    <div>
      <PageHeader
        title="Guardian dashboard"
        description="Monitor your child's academic progress (read-only)"
      />
      {children.length === 0 ? (
        <p className="text-sm text-slate-500">No linked children yet.</p>
      ) : (
        <>
          <select
            className="mb-4 w-full max-w-md rounded-md border px-3 py-2 text-sm"
            value={selected ?? ""}
            onChange={(e) => setStudentId(e.target.value)}
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({c.className})
              </option>
            ))}
          </select>
          <p className="mb-4 text-sm">
            Overall weighted percentage:{" "}
            <strong>
              {progress?.overall?.percentage == null
                ? "No recorded marks"
                : `${progress.overall.percentage}% (${progress.overall.evaluationCount} evaluations)`}
            </strong>
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border bg-white p-4 text-sm">
              <h2 className="font-semibold">Today&apos;s homework</h2>
              <ul className="mt-3 space-y-2">
                {todayHomework.length === 0 ? (
                  <li className="text-slate-500">None</li>
                ) : (
                  todayHomework.map((h) => (
                    <li key={String(h.id)}>{String(h.title)}</li>
                  ))
                )}
              </ul>
            </section>
            <section className="rounded-xl border bg-white p-4 text-sm">
              <h2 className="font-semibold">Today&apos;s evaluations</h2>
              <ul className="mt-3 space-y-2">
                {todayEvals.length === 0 ? (
                  <li className="text-slate-500">None</li>
                ) : (
                  todayEvals.map((e) => (
                    <li key={String(e.id)} className="flex justify-between">
                      <span>{String(e.lessonOrChapter)}</span>
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
          {selected ? (
            <p className="mt-4 text-sm">
              <Link
                className="text-teal-700 hover:underline"
                href={`/guardian/children/${selected}/progress`}
              >
                View full progress →
              </Link>
            </p>
          ) : null}
          <p className="mt-1 text-xs text-slate-400">
            As of {formatDate(new Date())}
          </p>
        </>
      )}
    </div>
  );
}
