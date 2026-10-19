"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { useEvaluations } from "@/hooks/use-server-state";
import { formatDate, formatMarks } from "@/lib/format";

export default function TeacherEvaluationsPage() {
  const { data, isLoading } = useEvaluations({ limit: 50 });

  return (
    <div>
      <PageHeader
        title="Evaluations"
        description="Lesson preparation, homework completion, and marks"
        actions={
          <Button asChild>
            <Link href="/teacher/evaluations/new">Record evaluation</Link>
          </Button>
        }
      />
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Lesson</th>
              <th className="px-4 py-3">Prep</th>
              <th className="px-4 py-3">HW</th>
              <th className="px-4 py-3">Marks</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : (
              (data?.items ?? []).map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{formatDate(e.evaluationDate)}</td>
                  <td className="px-4 py-3">{e.student?.fullName}</td>
                  <td className="px-4 py-3">{e.subject?.name}</td>
                  <td className="px-4 py-3">{e.lessonOrChapter}</td>
                  <td className="px-4 py-3">{e.preparationStatus}</td>
                  <td className="px-4 py-3">{e.homeworkStatus}</td>
                  <td className="px-4 py-3">
                    {formatMarks(e.marksObtained, e.maximumMarks)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
