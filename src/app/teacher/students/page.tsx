"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateStudent,
  useStudents,
  useSubjects,
} from "@/hooks/use-server-state";
import { createSubject } from "@/services/api";
import { getErrorMessage } from "@/lib/api";
import { todayISO } from "@/lib/format";
import {
  CLASS_OPTIONS,
  DEFAULT_CLASS,
  getSubjectsForClass,
} from "@/lib/curriculum";
import { toast } from "sonner";

const emptyForm = () => ({
  fullName: "",
  className: DEFAULT_CLASS as string,
  schoolName: "",
  email: "",
  password: "Student@123",
  enrollmentDate: todayISO(),
  subjectNames: [] as string[],
});

export default function TeacherStudentsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useStudents({ search: search || undefined });
  const { data: subjects, refetch: refetchSubjects } = useSubjects();
  const create = useCreateStudent();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const curriculumSubjects = getSubjectsForClass(form.className);

  function setClassName(className: string) {
    const allowed = new Set(
      getSubjectsForClass(className).map((n) => n.toLowerCase()),
    );
    setForm({
      ...form,
      className,
      subjectNames: form.subjectNames.filter((n) =>
        allowed.has(n.toLowerCase()),
      ),
    });
  }

  async function resolveSubjectIds(names: string[]) {
    const existing = subjects ?? [];
    const ids: string[] = [];
    let createdAny = false;

    for (const name of names) {
      const found = existing.find(
        (s) => s.name.toLowerCase() === name.toLowerCase(),
      );
      if (found) {
        ids.push(found.id);
        continue;
      }
      const created = await createSubject({
        name,
        description: `Bangladeshi NCTB curriculum`,
      });
      ids.push(created.id);
      createdAny = true;
    }

    if (createdAny) await refetchSubjects();
    return ids;
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let subjectIds: string[];
      try {
        subjectIds = await resolveSubjectIds(form.subjectNames);
      } catch (err) {
        toast.error(getErrorMessage(err));
        return;
      }
      await create.mutateAsync({
        fullName: form.fullName,
        className: form.className,
        schoolName: form.schoolName || null,
        enrollmentDate: form.enrollmentDate,
        email: form.email || undefined,
        password: form.email ? form.password : undefined,
        subjectIds,
      });
      setOpen(false);
      setForm(emptyForm());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Students"
        description="Create, search, and manage coaching students"
        actions={
          <Button onClick={() => setOpen((v) => !v)}>
            {open ? "Close form" : "Add student"}
          </Button>
        }
      />

      {open ? (
        <form
          onSubmit={onCreate}
          className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2"
        >
          <div>
            <Label>Full name</Label>
            <Input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="className">Class</Label>
            <select
              id="className"
              required
              value={form.className}
              onChange={(e) => setClassName(e.target.value)}
              className="flex h-10 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>School</Label>
            <Input
              value={form.schoolName}
              onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
            />
          </div>
          <div>
            <Label>Enrollment date</Label>
            <Input
              type="date"
              required
              value={form.enrollmentDate}
              onChange={(e) =>
                setForm({ ...form, enrollmentDate: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Login email (optional)</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <Label>Temp password</Label>
            <Input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label>
              Subjects (Bangladeshi curriculum — {form.className})
            </Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {curriculumSubjects.map((name) => {
                const checked = form.subjectNames.includes(name);
                return (
                  <label
                    key={name}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setForm({
                          ...form,
                          subjectNames: checked
                            ? form.subjectNames.filter((n) => n !== name)
                            : [...form.subjectNames, name],
                        })
                      }
                    />
                    {name}
                  </label>
                );
              })}
            </div>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={saving || create.isPending}>
              Save student
            </Button>
          </div>
        </form>
      ) : null}

      <div className="mb-4">
        <Input
          placeholder="Search by name or student code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={5}>
                  Loading…
                </td>
              </tr>
            ) : (data?.items ?? []).length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={5}>
                  No students yet.
                </td>
              </tr>
            ) : (
              data!.items.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{s.studentCode}</td>
                  <td className="px-4 py-3">{s.fullName}</td>
                  <td className="px-4 py-3">{s.className}</td>
                  <td className="px-4 py-3">{s.status}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      className="text-teal-700 hover:underline"
                      href={`/teacher/students/${s.id}`}
                    >
                      Open
                    </Link>
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
