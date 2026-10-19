"use client";

import { useParams } from "next/navigation";
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
import { useHistory, useProgress } from "@/hooks/use-server-state";
import { formatDate, formatMarks } from "@/lib/format";

export default function GuardianChildProgressPage() {
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId;
  const { data: progress } = useProgress({ studentId }, !!studentId);
  const { data: history } = useHistory({ studentId, limit: 30 }, !!studentId);

  const subjects =
    (progress?.subjects as Array<{
      subjectName: string;
      percentage: number | null;
    }>) ?? [];
  const chartData = subjects
    .filter((s) => s.percentage != null)
    .map((s) => ({ name: s.subjectName, percentage: s.percentage }));

  return (
    <div>
      <PageHeader title="Child progress" description="Read-only academic view" />
      {chartData.length === 0 ? (
        <p className="mb-4 text-sm text-slate-500">No scored evaluations yet.</p>
      ) : (
        <div className="mb-6 h-64 rounded-xl border bg-white p-4">
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
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Lesson</th>
              <th className="px-4 py-3">Marks</th>
              <th className="px-4 py-3">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {(history?.items ?? []).map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="px-4 py-3">{formatDate(e.evaluationDate)}</td>
                <td className="px-4 py-3">{e.subject?.name}</td>
                <td className="px-4 py-3">{e.lessonOrChapter}</td>
                <td className="px-4 py-3">
                  {formatMarks(e.marksObtained, e.maximumMarks)}
                </td>
                <td className="px-4 py-3">{e.teacherFeedback || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
