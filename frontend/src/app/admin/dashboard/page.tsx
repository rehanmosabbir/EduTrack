"use client";

import { useAdminDashboard } from "@/hooks/use-server-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/empty-state";
import { StudyHoursChart, ScoreTrendChart } from "@/components/charts/charts";
import { formatPercent } from "@/lib/utils";
import { format } from "date-fns";

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-sm text-red-600">
        Failed to load dashboard. Ensure the API is running.
      </p>
    );
  }

  const kpis = data.kpis as {
    totalStudents: number;
    activeStudents: number;
    avgStudyFormatted: string;
    avgScore: number | null;
    todayStudyFormatted: string;
  };
  const studyTrend = data.studyTrend as Array<{ date: string; hours: number }>;
  const scoreTrend = data.scoreTrend as Array<{
    date: string;
    average: number | null;
  }>;
  const recentActivities = data.recentActivities as Array<{
    id: string;
    action: string;
    createdAt: string;
    user: { name: string };
  }>;
  const needingAttention = data.needingAttention as Array<{
    id: string;
    name: string;
    reasons: string[];
    avgScore: number | null;
  }>;
  const recentScores = data.recentScores as Array<{
    id: string;
    percentage: number;
    examName: string;
    student: { user: { name: string } };
    subject: { name: string };
  }>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Academic Progress</h1>
        <p className="text-sm text-slate-500">
          Monitor students, study hours, and academic performance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Students" value={String(kpis.totalStudents)} sub={`${kpis.activeStudents} active`} />
        <Kpi title="Avg Study Time" value={kpis.avgStudyFormatted} sub="Last 30 days" />
        <Kpi title="Avg Score" value={formatPercent(kpis.avgScore)} sub="All exams" />
        <Kpi title="Today's Study" value={kpis.todayStudyFormatted} sub="All students" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Study Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <StudyHoursChart data={studyTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Score Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart data={scoreTrend} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="pb-2 font-medium">User</th>
                    <th className="pb-2 font-medium">Activity</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100">
                      <td className="py-2.5">{a.user.name}</td>
                      <td className="py-2.5">{a.action.replaceAll("_", " ")}</td>
                      <td className="py-2.5 text-slate-500">
                        {format(new Date(a.createdAt), "dd MMM yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students Needing Attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {needingAttention.length === 0 ? (
              <p className="text-sm text-slate-500">All students look good.</p>
            ) : (
              needingAttention.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2"
                >
                  <p className="text-sm font-medium text-slate-800">{s.name}</p>
                  <p className="text-xs text-amber-700">
                    {s.reasons.join(" · ")}
                    {s.avgScore !== null ? ` · Avg ${formatPercent(s.avgScore)}` : ""}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Score Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-2 font-medium">Student</th>
                  <th className="pb-2 font-medium">Subject</th>
                  <th className="pb-2 font-medium">Exam</th>
                  <th className="pb-2 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {recentScores.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="py-2.5">{s.student.user.name}</td>
                    <td className="py-2.5">{s.subject.name}</td>
                    <td className="py-2.5">{s.examName}</td>
                    <td className="py-2.5 font-medium text-indigo-700">
                      {formatPercent(s.percentage)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        <p className="mt-1 text-xs text-slate-400">{sub}</p>
      </CardContent>
    </Card>
  );
}
