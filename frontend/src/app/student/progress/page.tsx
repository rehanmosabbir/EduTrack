"use client";

import { useSession } from "next-auth/react";
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
import { useProgress } from "@/hooks/use-server-state";

export default function StudentProgressPage() {
  const { data: session } = useSession();
  const studentId = session?.user?.studentId ?? "";
  const { data, isLoading } = useProgress({ studentId }, !!studentId);

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
        title="My progress"
        description="Subject-wise weighted averages (missing marks are not treated as zero)"
      />
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <>
          <p className="mb-4 text-sm">
            Overall:{" "}
            <strong>
              {overall?.percentage == null
                ? "No recorded marks"
                : `${overall.percentage}% across ${overall.evaluationCount} evaluations`}
            </strong>
          </p>
          {chartData.length === 0 ? (
            <p className="text-sm text-slate-500">No scored evaluations yet.</p>
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
