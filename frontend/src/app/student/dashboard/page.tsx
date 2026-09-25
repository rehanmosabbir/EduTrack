"use client";

import { useStudentDashboard } from "@/hooks/use-server-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/empty-state";
import {
  StudyHoursChart,
  ScoreTrendChart,
  SubjectBarChart,
} from "@/components/charts/charts";
import { formatDuration, formatPercent } from "@/lib/utils";

export default function StudentDashboardPage() {
  const { data, isLoading, error } = useStudentDashboard();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-sm text-red-600">Failed to load your dashboard.</p>
    );
  }

  const studyStats = data.studyStats as {
    todayMinutes: number;
    todayFormatted: string;
    weeklyFormatted: string;
    monthlyFormatted: string;
    currentStreak: number;
  };
  const scoreStats = data.scoreStats as {
    overallAverage: number | null;
    highestScore: number | null;
    numberOfTests: number;
    bySubject: Array<{ subjectName: string; average: number }>;
    progression: Array<{ date: string; percentage: number }>;
  };
  const studyTrend = data.studyTrend as Array<{ date: string; hours: number }>;
  const todayProgressPct = data.todayProgressPct as number;
  const todayTargetMinutes = data.todayTargetMinutes as number;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
        <p className="text-sm text-slate-500">
          Track today&apos;s study and academic progress
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Today&apos;s Study</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-indigo-700">
              {studyStats.todayFormatted}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Target: {formatDuration(todayTargetMinutes)}
            </p>
            <Progress value={todayProgressPct} className="mt-4" />
            <p className="mt-2 text-xs text-slate-400">
              {todayProgressPct}% of daily target · Streak {studyStats.currentStreak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            <Stat label="Average" value={formatPercent(scoreStats.overallAverage)} />
            <Stat label="Highest" value={formatPercent(scoreStats.highestScore)} />
            <Stat label="Tests" value={String(scoreStats.numberOfTests)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Study Totals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="This week" value={studyStats.weeklyFormatted} />
            <Row label="This month" value={studyStats.monthlyFormatted} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Study Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <StudyHoursChart data={studyTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Score Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart
              data={scoreStats.progression.map((p) => ({
                date: p.date,
                average: p.percentage,
              }))}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <SubjectBarChart data={scoreStats.bySubject ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
