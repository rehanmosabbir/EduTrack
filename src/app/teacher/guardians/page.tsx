"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateGuardian,
  useGuardians,
  useLinkGuardian,
  useStudents,
} from "@/hooks/use-server-state";

export default function TeacherGuardiansPage() {
  const { data, isLoading } = useGuardians({ limit: 50 });
  const { data: students } = useStudents({ limit: 100 });
  const create = useCreateGuardian();
  const link = useLinkGuardian();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "Guardian@123",
    phone: "",
  });
  const [linkForm, setLinkForm] = useState({
    guardianId: "",
    studentId: "",
    relationship: "Parent",
  });

  return (
    <div>
      <PageHeader
        title="Guardians"
        description="Create guardian accounts and link them to students"
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <form
          className="grid gap-3 rounded-xl border bg-white p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await create.mutateAsync({
              ...form,
              phone: form.phone || null,
            });
            setForm({
              name: "",
              email: "",
              password: "Guardian@123",
              phone: "",
            });
          }}
        >
          <h2 className="font-semibold">Create guardian</h2>
          <div>
            <Label>Name</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={create.isPending}>
            Create
          </Button>
        </form>

        <form
          className="grid gap-3 rounded-xl border bg-white p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await link.mutateAsync(linkForm);
          }}
        >
          <h2 className="font-semibold">Link guardian to student</h2>
          <div>
            <Label>Guardian</Label>
            <select
              required
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={linkForm.guardianId}
              onChange={(e) =>
                setLinkForm({ ...linkForm, guardianId: e.target.value })
              }
            >
              <option value="">Select</option>
              {(data?.items ?? []).map((g) => {
                const item = g as {
                  id: string;
                  user: { name: string; email: string };
                };
                return (
                  <option key={item.id} value={item.id}>
                    {item.user.name} ({item.user.email})
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <Label>Student</Label>
            <select
              required
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={linkForm.studentId}
              onChange={(e) =>
                setLinkForm({ ...linkForm, studentId: e.target.value })
              }
            >
              <option value="">Select</option>
              {(students?.items ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Relationship</Label>
            <Input
              value={linkForm.relationship}
              onChange={(e) =>
                setLinkForm({ ...linkForm, relationship: e.target.value })
              }
            />
          </div>
          <Button type="submit" disabled={link.isPending}>
            Link
          </Button>
        </form>
      </div>

      <ul className="space-y-2">
        {isLoading ? (
          <li className="text-sm text-slate-500">Loading…</li>
        ) : (
          (data?.items ?? []).map((g) => {
            const item = g as {
              id: string;
              user: { name: string; email: string };
              students: Array<{
                relationship: string;
                student: { fullName: string };
              }>;
            };
            return (
              <li key={item.id} className="rounded-xl border bg-white p-4 text-sm">
                <p className="font-medium">
                  {item.user.name}{" "}
                  <span className="font-normal text-slate-500">
                    {item.user.email}
                  </span>
                </p>
                <p className="mt-1 text-slate-600">
                  Children:{" "}
                  {item.students.length
                    ? item.students
                        .map(
                          (l) =>
                            `${l.student.fullName} (${l.relationship})`,
                        )
                        .join(", ")
                    : "None linked"}
                </p>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
