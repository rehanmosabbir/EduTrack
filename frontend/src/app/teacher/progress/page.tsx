"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/ui/page-header";
import { useProgress, useStudents } from "@/hooks/use-server-state";

export default function TeacherProgressPage() {
  const { data: students } = useStudents({ status: "ACTIVE", limit: 100 });
  const [studentId, setStudentId] = useState("");
  const { data, isLoading } = useProgress(
    { studentId },
    !!studentId,
  );

  const subjects =
    (data?.subjects as Array<{
      subjectName: string;
      percentage: number | null;
      evaluationCount: number;
    }>) ?? [];
  const chartData = subjects
    .filter((s) => s.percentage != null)
    .map((s) => ({ name: s.subjectName, percentage: s.percentage }));

  const overall = data?.overall as
    | { percentage: number | null; evaluationCount: number }
    | undefined;

  return (
    <div>
      <PageHeader
        title="Student progress"
        description="Weighted averages use sum(obtained) ÷ sum(maximum) × 100"
      />
      <select
        className="mb-4 w-full max-w-md rounded-md border px-3 py-2 text-sm"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      >
        <option value="">Select student</option>
        {(students?.items ?? []).map((s) => (
          <option key={s.id} value={s.id}>
            {s.fullName}
          </option>
        ))}
      </select>

      {!studentId ? (
        <p className="text-sm text-slate-500">Choose a student to view progress.</p>
      ) : isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-600">
            Overall weighted percentage:{" "}
            <strong>
              {overall?.percentage == null
                ? "No recorded marks"
                : `${overall.percentage}% (${overall.evaluationCount} evaluations)`}
            </strong>
          </p>
          {chartData.length === 0 ? (
            <p className="text-sm text-slate-500">
              No scored evaluations yet for this student.
            </p>
          ) : (
            <div className="h-72 rounded-xl border bg-white p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
