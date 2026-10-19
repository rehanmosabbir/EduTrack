"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  useStudent,
  useUpdateStudent,
  useHistory,
  useProgress,
} from "@/hooks/use-server-state";
import { formatDate, formatMarks } from "@/lib/format";

export default function TeacherStudentDetailPage() {
  const params = useParams<{ studentId: string }>();
  const id = params.studentId;
  const { data: student, isLoading } = useStudent(id);
  const update = useUpdateStudent();
  const { data: history } = useHistory({ studentId: id, limit: 10 });
  const { data: progress } = useProgress({ studentId: id });

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (!student) return <p className="text-sm text-red-600">Student not found.</p>;

  const subjects =
    (progress?.subjects as Array<{
      subjectName: string;
      percentage: number | null;
      evaluationCount: number;
    }>) ?? [];

  return (
    <div>
      <PageHeader
        title={student.fullName}
        description={`${student.studentCode} · ${student.className}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/teacher/homework/new?studentId=${id}`}>
                Assign homework
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/teacher/evaluations/new?studentId=${id}`}>
                Record evaluation
              </Link>
            </Button>
            {student.status === "ACTIVE" ? (
              <Button
                variant="outline"
                onClick={() =>
                  update.mutate({ id, payload: { status: "INACTIVE" } })
                }
              >
                Deactivate
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() =>
                  update.mutate({ id, payload: { status: "ACTIVE" } })
                }
              >
                Reactivate
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 text-sm">
          <p className="text-slate-500">School</p>
          <p className="font-medium">{student.schoolName || "—"}</p>
          <p className="mt-3 text-slate-500">Enrollment</p>
          <p className="font-medium">{formatDate(student.enrollmentDate)}</p>
          <p className="mt-3 text-slate-500">Login</p>
          <p className="font-medium">{student.user?.email || "No login"}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 md:col-span-2">
          <h2 className="font-semibold">Subject averages</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {subjects.length === 0 ? (
              <li className="text-slate-500">No recorded marks yet.</li>
            ) : (
              subjects.map((s) => (
                <li key={s.subjectName} className="flex justify-between">
                  <span>{s.subjectName}</span>
                  <span>
                    {s.percentage == null
                      ? "No marks"
                      : `${s.percentage}% (${s.evaluationCount} evals)`}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <section className="mt-6 rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Recent academic history</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Subject</th>
                <th className="py-2 pr-3">Lesson</th>
                <th className="py-2 pr-3">Prep</th>
                <th className="py-2 pr-3">HW</th>
                <th className="py-2">Marks</th>
              </tr>
            </thead>
            <tbody>
              {(history?.items ?? []).map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="py-2 pr-3">{formatDate(e.evaluationDate)}</td>
                  <td className="py-2 pr-3">{e.subject?.name}</td>
                  <td className="py-2 pr-3">{e.lessonOrChapter}</td>
                  <td className="py-2 pr-3">{e.preparationStatus}</td>
                  <td className="py-2 pr-3">{e.homeworkStatus}</td>
                  <td className="py-2">
                    {formatMarks(e.marksObtained, e.maximumMarks)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
