"use client";

import { useState } from "react";
import {
  useScoreStats,
  useScores,
  useSubjects,
} from "@/hooks/use-server-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreTrendChart, SubjectBarChart } from "@/components/charts/charts";
import { formatPercent } from "@/lib/utils";
import { Skeleton } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";

export default function StudentProgressPage() {
  const [subjectId, setSubjectId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data: subjects } = useSubjects({ limit: 100 });
  const { data: stats, isLoading } = useScoreStats({
    subjectId: subjectId || undefined,
  });
  const { data: scores } = useScores({
    subjectId: subjectId || undefined,
    from: from || undefined,
    to: to || undefined,
    limit: 50,
  });

  const s = stats as
    | {
        overallAverage: number | null;
        highestScore: number | null;
        lowestScore: number | null;
        improvement: number | null;
        numberOfTests: number;
        bySubject: Array<{
          subjectName: string;
          previousAverage: number | null;
          currentAverage: number;
          improvement: number | null;
          average: number;
        }>;
        progression: Array<{ date: string; percentage: number }>;
      }
    | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Progress</h1>
        <p className="text-sm text-slate-500">
          Score improvement and subject-wise performance
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
        >
          <option value="">All subjects</option>
          {(subjects?.items ?? []).map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
        <Input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-auto"
        />
        <Input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-auto"
        />
      </div>

      {isLoading || !s ? (
        <Skeleton className="h-40" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat label="Average" value={formatPercent(s.overallAverage)} />
            <Stat label="Highest" value={formatPercent(s.highestScore)} />
            <Stat label="Lowest" value={formatPercent(s.lowestScore)} />
            <Stat label="Tests" value={String(s.numberOfTests)} />
            <Stat
              label="Improvement"
              value={
                s.improvement === null
                  ? "—"
                  : `${s.improvement > 0 ? "+" : ""}${s.improvement}%`
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {s.bySubject.map((sub) => (
              <Card key={sub.subjectName}>
                <CardContent className="pt-5">
                  <p className="font-semibold text-slate-900">{sub.subjectName}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Previous Average: {formatPercent(sub.previousAverage)}
                  </p>
                  <p className="text-sm text-slate-500">
                    Current Average: {formatPercent(sub.currentAverage)}
                  </p>
                  <p className="mt-2 text-lg font-bold text-indigo-700">
                    Improvement:{" "}
                    {sub.improvement === null
                      ? "—"
                      : `${sub.improvement > 0 ? "+" : ""}${sub.improvement}%`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Score Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreTrendChart
                  data={s.progression.map((p) => ({
                    date: p.date,
                    average: p.percentage,
                  }))}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Subject-wise</CardTitle>
              </CardHeader>
              <CardContent>
                <SubjectBarChart data={s.bySubject} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Score History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-slate-500">
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Subject</th>
                      <th className="pb-2 font-medium">Exam</th>
                      <th className="pb-2 font-medium">Score</th>
                      <th className="pb-2 font-medium">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(scores?.items ?? []).map((sc) => (
                      <tr key={sc.id} className="border-b border-slate-100">
                        <td className="py-2.5">{sc.examDate.slice(0, 10)}</td>
                        <td className="py-2.5">{sc.subject?.name}</td>
                        <td className="py-2.5">{sc.examName}</td>
                        <td className="py-2.5 font-medium text-indigo-700">
                          {formatPercent(sc.percentage)}
                        </td>
                        <td className="py-2.5">{sc.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
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
