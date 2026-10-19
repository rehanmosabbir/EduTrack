"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateHomework,
  useStudents,
  useSubjects,
} from "@/hooks/use-server-state";
import { getErrorMessage } from "@/lib/api";
import { todayISO } from "@/lib/format";
import {
  CLASS_OPTIONS,
  DEFAULT_CLASS,
  getSubjectsForClass,
} from "@/lib/curriculum";
import { resolveSubjectIds } from "@/lib/resolve-subjects";
import { toast } from "sonner";

function NewHomeworkPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: students } = useStudents({ status: "ACTIVE", limit: 100 });
  const { data: subjects, refetch: refetchSubjects } = useSubjects();
  const create = useCreateHomework();
  const [className, setClassName] = useState<string>(DEFAULT_CLASS);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    studentId: params.get("studentId") ?? "",
    subjectName: "",
    title: "",
    lessonOrChapter: "",
    instructions: "",
    assignedAt: todayISO(),
    dueDate: "",
    maximumMarks: "",
  });

  const activeStudents = useMemo(() => {
    const items = students?.items ?? [];
    return items.filter((s) => s.className === className);
  }, [students, className]);

  const curriculumSubjects = useMemo(
    () => getSubjectsForClass(className),
    [className],
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
    const allowed = new Set(
      getSubjectsForClass(nextClass).map((n) => n.toLowerCase()),
    );
    const subjectStillValid = allowed.has(form.subjectName.toLowerCase());
    const studentStillValid = (students?.items ?? []).some(
      (s) => s.id === form.studentId && s.className === nextClass,
    );
    setForm({
      ...form,
      studentId: studentStillValid ? form.studentId : "",
      subjectName: subjectStillValid ? form.subjectName : "",
    });
  }

  function onStudentChange(studentId: string) {
    const student = (students?.items ?? []).find((s) => s.id === studentId);
    if (student && student.className !== className) {
      setClassName(student.className);
      const allowed = new Set(
        getSubjectsForClass(student.className).map((n) => n.toLowerCase()),
      );
      const subjectStillValid = allowed.has(form.subjectName.toLowerCase());
      setForm({
        ...form,
        studentId,
        subjectName: subjectStillValid ? form.subjectName : "",
      });
      return;
    }
    setForm({ ...form, studentId });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const [subjectId] = await resolveSubjectIds(
        [form.subjectName],
        subjects ?? [],
        () => refetchSubjects(),
      );
      await create.mutateAsync({
        studentId: form.studentId,
        subjectId,
        title: form.title,
        lessonOrChapter: form.lessonOrChapter,
        instructions: form.instructions,
        assignedAt: form.assignedAt,
        dueDate: form.dueDate || null,
        maximumMarks: form.maximumMarks ? Number(form.maximumMarks) : null,
      });
      router.push("/teacher/homework");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Assign individual homework"
        description="This assignment is created for one student only"
      />
      <form
        className="grid max-w-2xl gap-3 rounded-xl border bg-white p-4"
        onSubmit={onSubmit}
      >
        <div>
          <Label htmlFor="homework-class">Class</Label>
          <select
            id="homework-class"
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
                {s.fullName} ({s.studentCode})
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Subject</Label>
          <select
            required
            className="mt-1 w-full cursor-pointer rounded-md border px-3 py-2 text-sm"
            value={form.subjectName}
            onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
          >
            <option value="">Select subject</option>
            {curriculumSubjects.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Title</Label>
          <Input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
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
        <div>
          <Label>Instructions</Label>
          <Textarea
            required
            value={form.instructions}
            onChange={(e) =>
              setForm({ ...form, instructions: e.target.value })
            }
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Assigned</Label>
            <Input
              type="date"
              required
              value={form.assignedAt}
              onChange={(e) =>
                setForm({ ...form, assignedAt: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Due (optional)</Label>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <div>
            <Label>Max marks (optional)</Label>
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
        <Button type="submit" disabled={saving || create.isPending}>
          Assign homework
        </Button>
      </form>
    </div>
  );
}

export default function NewHomeworkPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
      <NewHomeworkPageInner />
    </Suspense>
  );
}
