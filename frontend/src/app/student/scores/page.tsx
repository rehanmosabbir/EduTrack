"use client";

import { useScores } from "@/hooks/use-server-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";

export default function StudentScoresPage() {
  const { data, isLoading } = useScores({ limit: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Scores</h1>
        <p className="text-sm text-slate-500">
          Teacher-entered exam scores (read-only)
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Score History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : !data?.items.length ? (
            <EmptyState title="No scores yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Subject</th>
                    <th className="pb-2 font-medium">Exam</th>
                    <th className="pb-2 font-medium">Marks</th>
                    <th className="pb-2 font-medium">%</th>
                    <th className="pb-2 font-medium">Grade</th>
                    <th className="pb-2 font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100">
                      <td className="py-2.5">{s.examDate.slice(0, 10)}</td>
                      <td className="py-2.5">{s.subject?.name}</td>
                      <td className="py-2.5">{s.examName}</td>
                      <td className="py-2.5">
                        {s.obtainedMarks}/{s.totalMarks}
                      </td>
                      <td className="py-2.5 font-medium text-indigo-700">
                        {formatPercent(s.percentage)}
                      </td>
                      <td className="py-2.5">{s.grade}</td>
                      <td className="py-2.5 text-slate-500">{s.remarks ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
