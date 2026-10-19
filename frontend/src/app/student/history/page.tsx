"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { useHistory, useSubjects } from "@/hooks/use-server-state";
import { formatDate, formatMarks } from "@/lib/format";

export default function StudentHistoryPage() {
  const { data: session } = useSession();
  const studentId = session?.user?.studentId ?? "";
  const { data: subjects } = useSubjects();
  const [subjectId, setSubjectId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data, isLoading } = useHistory(
    {
      studentId,
      subjectId: subjectId || undefined,
      from: from || undefined,
      to: to || undefined,
      limit: 50,
    },
    !!studentId,
  );

  return (
    <div>
      <PageHeader
        title="Academic history"
        description="Date-wise evaluations (read-only)"
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <select
          className="rounded-md border px-3 py-2 text-sm"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
        >
          <option value="">All subjects</option>
          {(subjects ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Lesson</th>
              <th className="px-4 py-3">Prep</th>
              <th className="px-4 py-3">HW</th>
              <th className="px-4 py-3">Marks</th>
              <th className="px-4 py-3">Feedback</th>
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
                  <td className="px-4 py-3">{e.subject?.name}</td>
                  <td className="px-4 py-3">{e.lessonOrChapter}</td>
                  <td className="px-4 py-3">{e.preparationStatus}</td>
                  <td className="px-4 py-3">{e.homeworkStatus}</td>
                  <td className="px-4 py-3">
                    {formatMarks(e.marksObtained, e.maximumMarks)}
                  </td>
                  <td className="px-4 py-3">{e.teacherFeedback || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
