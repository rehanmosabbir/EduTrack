"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateEvaluation,
  useHomework,
  useStudents,
  useSubjects,
} from "@/hooks/use-server-state";
import { todayISO } from "@/lib/format";
import {
  CLASS_OPTIONS,
  DEFAULT_CLASS,
  filterSubjectsForClass,
} from "@/lib/curriculum";

const emptyForm = (studentId = "") => ({
  studentId,
  subjectId: "",
  homeworkAssignmentId: "",
  evaluationDate: todayISO(),
  lessonOrChapter: "",
  preparationStatus: "PREPARED",
  homeworkStatus: "COMPLETED",
  marksObtained: "",
  maximumMarks: "",
  teacherFeedback: "",
  privateTeacherNotes: "",
});

function NewEvaluationPageInner() {
  const params = useSearchParams();
  const { data: students } = useStudents({ status: "ACTIVE", limit: 100 });
  const { data: subjects } = useSubjects();
  const create = useCreateEvaluation();
  const [className, setClassName] = useState<string>(DEFAULT_CLASS);
  const [form, setForm] = useState(emptyForm(params.get("studentId") ?? ""));
  const [savedCount, setSavedCount] = useState(0);

  const { data: homework } = useHomework({
    studentId: form.studentId || undefined,
    status: "ACTIVE",
    limit: 20,
  });

  const activeStudents = useMemo(() => {
    const items = students?.items ?? [];
    return items.filter((s) => s.className === className);
  }, [students, className]);

  const classSubjects = useMemo(
    () => filterSubjectsForClass(subjects ?? [], className),
    [subjects, className],
  );

  useEffect(() => {
    if (!form.studentId || !students?.items) return;
    const student = students.items.find((s) => s.id === form.studentId);
    if (student && student.className !== className) {
      setClassName(student.className);
    }
  }, [students, form.studentId, className]);

  function onClassChange(nextClass: string) {
    setClassName(nextClass);
    const allowed = filterSubjectsForClass(subjects ?? [], nextClass);
    const subjectStillValid = allowed.some((s) => s.id === form.subjectId);
    const studentStillValid = (students?.items ?? []).some(
      (s) => s.id === form.studentId && s.className === nextClass,
    );
    setForm({
      ...form,
      studentId: studentStillValid ? form.studentId : "",
      subjectId: subjectStillValid ? form.subjectId : "",
      homeworkAssignmentId: studentStillValid ? form.homeworkAssignmentId : "",
    });
  }

  function onStudentChange(studentId: string) {
    const student = (students?.items ?? []).find((s) => s.id === studentId);
    if (student && student.className !== className) {
      setClassName(student.className);
      const allowed = filterSubjectsForClass(subjects ?? [], student.className);
      const subjectStillValid = allowed.some((s) => s.id === form.subjectId);
      setForm({
        ...form,
        studentId,
        subjectId: subjectStillValid ? form.subjectId : "",
        homeworkAssignmentId: "",
      });
      return;
    }
    setForm({ ...form, studentId, homeworkAssignmentId: "" });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clientRequestId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    const hasMarks = form.marksObtained !== "" || form.maximumMarks !== "";
    await create.mutateAsync({
      studentId: form.studentId,
      subjectId: form.subjectId,
      homeworkAssignmentId: form.homeworkAssignmentId || null,
      evaluationDate: form.evaluationDate,
      lessonOrChapter: form.lessonOrChapter,
      preparationStatus: form.preparationStatus,
      homeworkStatus: form.homeworkStatus,
      marksObtained: hasMarks ? Number(form.marksObtained || 0) : null,
      maximumMarks: hasMarks ? Number(form.maximumMarks) : null,
      teacherFeedback: form.teacherFeedback || null,
      privateTeacherNotes: form.privateTeacherNotes || null,
      clientRequestId,
    });
    setSavedCount((n) => n + 1);
    // Keep page open for successive students; clear student-specific fields
    setForm((prev) => ({
      ...emptyForm(""),
      evaluationDate: prev.evaluationDate,
      subjectId: prev.subjectId,
    }));
  }

  return (
    <div>
      <PageHeader
        title="Record evaluation"
        description="Save and continue for the next student without leaving this page"
      />
      {savedCount > 0 ? (
        <p className="mb-3 text-sm text-teal-700">
          Saved {savedCount} evaluation{savedCount === 1 ? "" : "s"} this session.
        </p>
      ) : null}
      <form
        className="grid max-w-2xl gap-3 rounded-xl border bg-white p-4"
        onSubmit={onSubmit}
      >
        <div>
          <Label htmlFor="evaluation-class">Class</Label>
          <select
            id="evaluation-class"
            required
            className="mt-1 w-full cursor-pointer rounded-md border px-3 py-2 text-sm"
            value={className}
            onChange={(e) => onClassChange(e.target.value)}
          >
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Student</Label>
          <select
            required
            className="mt-1 w-full cursor-pointer rounded-md border px-3 py-2 text-sm"
            value={form.studentId}
            onChange={(e) => onStudentChange(e.target.value)}
          >
            <option value="">Select student</option>
            {activeStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Subject</Label>
            <select
              required
              className="mt-1 w-full cursor-pointer rounded-md border px-3 py-2 text-sm"
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
            >
              <option value="">Select subject</option>
              {classSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              required
              value={form.evaluationDate}
              onChange={(e) =>
                setForm({ ...form, evaluationDate: e.target.value })
              }
            />
          </div>
        </div>
        <div>
          <Label>Related homework (optional)</Label>
          <select
            className="mt-1 w-full cursor-pointer rounded-md border px-3 py-2 text-sm"
            value={form.homeworkAssignmentId}
            onChange={(e) =>
              setForm({ ...form, homeworkAssignmentId: e.target.value })
            }
          >
            <option value="">None / independent evaluation</option>
            {(homework?.items ?? []).map((h) => (
              <option key={h.id} value={h.id}>
                {h.title} — {h.lessonOrChapter}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Lesson / chapter</Label>
          <Input
            required
            value={form.lessonOrChapter}
            onChange={(e) =>
              setForm({ ...form, lessonOrChapter: e.target.value })
            }
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Preparation</Label>
            <select
              className="mt-1 w-full cursor-pointer rounded-md border px-3 py-2 text-sm"
              value={form.preparationStatus}
              onChange={(e) =>
                setForm({ ...form, preparationStatus: e.target.value })
              }
            >
              <option value="PREPARED">Prepared</option>
              <option value="PARTIALLY_PREPARED">Partially prepared</option>
              <option value="NOT_PREPARED">Not prepared</option>
            </select>
          </div>
          <div>
            <Label>Homework completion</Label>
            <select
              className="mt-1 w-full cursor-pointer rounded-md border px-3 py-2 text-sm"
              value={form.homeworkStatus}
              onChange={(e) =>
                setForm({ ...form, homeworkStatus: e.target.value })
              }
            >
              <option value="COMPLETED">Completed</option>
              <option value="PARTIALLY_COMPLETED">Partially completed</option>
              <option value="NOT_COMPLETED">Not completed</option>
            </select>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Marks obtained (leave blank if not scored)</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.marksObtained}
              onChange={(e) =>
                setForm({ ...form, marksObtained: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Maximum marks</Label>
            <Input
              type="number"
              min={0.01}
              step="0.01"
              value={form.maximumMarks}
              onChange={(e) =>
                setForm({ ...form, maximumMarks: e.target.value })
              }
            />
          </div>
        </div>
        <div>
          <Label>Feedback (visible to student/guardian)</Label>
          <Textarea
            value={form.teacherFeedback}
            onChange={(e) =>
              setForm({ ...form, teacherFeedback: e.target.value })
            }
          />
        </div>
        <div>
          <Label>Private teacher notes (never shown to student/guardian)</Label>
          <Textarea
            value={form.privateTeacherNotes}
            onChange={(e) =>
              setForm({ ...form, privateTeacherNotes: e.target.value })
            }
          />
        </div>
        <Button type="submit" disabled={create.isPending}>
          Save & continue
        </Button>
      </form>
    </div>
  );
}

export default function NewEvaluationPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
      <NewEvaluationPageInner />
    </Suspense>
  );
}
