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
import { todayISO } from "@/lib/format";

export default function TeacherStudentsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useStudents({ search: search || undefined });
  const { data: subjects } = useSubjects();
  const create = useCreateStudent();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    className: "HSC",
    schoolName: "",
    email: "",
    password: "Student@123",
    enrollmentDate: todayISO(),
    subjectIds: [] as string[],
  });

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    await create.mutateAsync({
      ...form,
      schoolName: form.schoolName || null,
      email: form.email || undefined,
      password: form.email ? form.password : undefined,
    });
    setOpen(false);
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
            <Label>Class</Label>
            <Input
              required
              value={form.className}
              onChange={(e) => setForm({ ...form, className: e.target.value })}
            />
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
            <Label>Subjects</Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {(subjects ?? []).map((s) => {
                const checked = form.subjectIds.includes(s.id);
                return (
                  <label key={s.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setForm({
                          ...form,
                          subjectIds: checked
                            ? form.subjectIds.filter((id) => id !== s.id)
                            : [...form.subjectIds, s.id],
                        })
                      }
                    />
                    {s.name}
                  </label>
                );
              })}
            </div>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={create.isPending}>
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
