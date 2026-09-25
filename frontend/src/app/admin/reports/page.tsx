"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import {
  useReport,
  useStudents,
  useSubjects,
} from "@/hooks/use-server-state";
import { exportReportCsv } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  StudyHoursChart,
  ScoreTrendChart,
  SubjectBarChart,
} from "@/components/charts/charts";
import { formatPercent } from "@/lib/utils";

export default function AdminReportsPage() {
  const [studentId, setStudentId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [examName, setExamName] = useState("");

  const filters = {
    studentId: studentId || undefined,
    subjectId: subjectId || undefined,
    from: from || undefined,
    to: to || undefined,
    examName: examName || undefined,
  };

  const { data: students } = useStudents({ limit: 100 });
  const { data: subjects } = useSubjects({ limit: 100 });
  const { data, isFetching, refetch } = useReport(filters);

  const summary = data?.summary as
    | {
        totalScores: number;
        avgScore: number | null;
        totalStudyFormatted: string;
        studyLogCount: number;
      }
    | undefined;

  const scoreStats = data?.scoreStats as
    | {
        bySubject: Array<{ subjectName: string; average: number }>;
        progression: Array<{ date: string; percentage: number }>;
      }
    | null
    | undefined;

  const studyLogs =
    (data?.studyLogs as Array<{
      date: string;
      studyHours: number;
      studyMinutes: number;
    }>) ?? [];

  const studyTrend = studyLogs.map((l) => ({
    date: l.date.slice(0, 10),
    hours: l.studyHours + l.studyMinutes / 60,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-slate-500">
            Filter academic and study performance
          </p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              await exportReportCsv(filters);
              toast.success("CSV exported.");
            } catch {
              toast.error("Failed to export CSV");
            }
          }}
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-3 pt-5 md:grid-cols-5">
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            <option value="">All students</option>
            {(students?.items ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.user.name}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            <option value="">All subjects</option>
            {(subjects?.items ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Input
            placeholder="Exam type"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
          />
          <Button
            className="md:col-span-5"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? "Loading..." : "Apply Filters"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Scores" value={String(summary?.totalScores ?? 0)} />
        <Stat label="Avg Score" value={formatPercent(summary?.avgScore)} />
        <Stat label="Study Time" value={summary?.totalStudyFormatted ?? "—"} />
        <Stat label="Study Logs" value={String(summary?.studyLogCount ?? 0)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Study Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <StudyHoursChart data={studyTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Score Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart
              data={(scoreStats?.progression ?? []).map((p) => ({
                date: p.date,
                average: p.percentage,
              }))}
            />
          </CardContent>
        </Card>
      </div>

      {scoreStats?.bySubject?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectBarChart data={scoreStats.bySubject} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
