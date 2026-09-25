"use client";

import { useParams } from "next/navigation";
import {
  useScoreStats,
  useStudent,
  useStudyStats,
} from "@/hooks/use-server-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/empty-state";
import { ScoreTrendChart, SubjectBarChart } from "@/components/charts/charts";
import { formatPercent } from "@/lib/utils";

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: student, isLoading } = useStudent(id);
  const { data: studyStats } = useStudyStats(id);
  const { data: scoreStats } = useScoreStats({ studentId: id });

  if (isLoading || !student) {
    return <Skeleton className="h-64" />;
  }

  const stats = studyStats as
    | {
        todayFormatted: string;
        weeklyFormatted: string;
        monthlyFormatted: string;
      }
    | undefined;

  const scores = scoreStats as
    | {
        bySubject: Array<{ subjectName: string; average: number }>;
        progression: Array<{ date: string; percentage: number }>;
      }
    | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Profile</h1>
        <p className="mt-1 text-lg font-medium text-indigo-700">
          {student.user.name}
        </p>
        <p className="text-sm text-slate-500">
          Class: {student.className ?? "—"} · Institution:{" "}
          {student.institution ?? "—"} · ID: {student.studentId}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Today</p>
            <p className="text-xl font-bold">{stats?.todayFormatted ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">This Week</p>
            <p className="text-xl font-bold">{stats?.weeklyFormatted ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">This Month</p>
            <p className="text-xl font-bold">{stats?.monthlyFormatted ?? "—"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Academic Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(scores?.bySubject ?? []).map((s) => (
              <div
                key={s.subjectName}
                className="rounded-lg border border-slate-100 px-3 py-2"
              >
                <p className="text-sm text-slate-500">{s.subjectName}</p>
                <p className="text-lg font-semibold text-indigo-700">
                  {formatPercent(s.average)}
                </p>
              </div>
            ))}
          </div>
          <SubjectBarChart data={scores?.bySubject ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Score History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreTrendChart
            data={(scores?.progression ?? []).map((p) => ({
              date: p.date,
              average: p.percentage,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
