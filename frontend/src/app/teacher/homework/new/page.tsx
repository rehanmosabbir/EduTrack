"use client";

import { Suspense, useMemo, useState } from "react";
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
import { todayISO } from "@/lib/format";

function NewHomeworkPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: students } = useStudents({ status: "ACTIVE", limit: 100 });
  const { data: subjects } = useSubjects();
  const create = useCreateHomework();
  const [form, setForm] = useState({
    studentId: params.get("studentId") ?? "",
    subjectId: "",
    title: "",
    lessonOrChapter: "",
    instructions: "",
    assignedAt: todayISO(),
    dueDate: "",
    maximumMarks: "",
  });

  const activeStudents = useMemo(() => students?.items ?? [], [students]);

  return (
    <div>
      <PageHeader
        title="Assign individual homework"
        description="This assignment is created for one student only"
      />
      <form
        className="grid max-w-2xl gap-3 rounded-xl border bg-white p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await create.mutateAsync({
            ...form,
            dueDate: form.dueDate || null,
            maximumMarks: form.maximumMarks
              ? Number(form.maximumMarks)
              : null,
          });
          router.push("/teacher/homework");
        }}
      >
        <div>
          <Label>Student</Label>
          <select
            required
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
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
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={form.subjectId}
            onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
          >
            <option value="">Select subject</option>
            {(subjects ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
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
        <Button type="submit" disabled={create.isPending}>
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
