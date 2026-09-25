"use client";

import Link from "next/link";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search } from "lucide-react";
import type { z } from "zod";
import {
  useCreateStudent,
  useDeleteStudent,
  useStudents,
} from "@/hooks/use-server-state";
import { studentFormSchema } from "@/validations/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput, SubmitButton } from "@/components/forms/form-fields";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";
import { formatPercent } from "@/lib/utils";

type StudentForm = z.infer<typeof studentFormSchema>;

export default function AdminStudentsPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useStudents({
    search: search || undefined,
    limit: 50,
  });
  const createMut = useCreateStudent();
  const deleteMut = useDeleteStudent();

  const form = useForm<StudentForm>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      studentId: "",
      className: "HSC",
      institution: "",
      phone: "",
      guardianName: "",
      guardianPhone: "",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-sm text-slate-500">Manage registered students</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>New Student</CardTitle>
          </CardHeader>
          <CardContent>
            <FormProvider {...form}>
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={form.handleSubmit((values) =>
                  createMut.mutate(values, {
                    onSuccess: () => {
                      setShowForm(false);
                      form.reset();
                    },
                  }),
                )}
              >
                <FormInput<StudentForm> name="name" label="Full Name" />
                <FormInput<StudentForm> name="email" label="Email (Google)" type="email" />
                <FormInput<StudentForm> name="studentId" label="Student ID" />
                <FormInput<StudentForm> name="className" label="Class" />
                <FormInput<StudentForm> name="institution" label="Institution" />
                <FormInput<StudentForm> name="phone" label="Phone" />
                <FormInput<StudentForm> name="guardianName" label="Guardian Name" />
                <FormInput<StudentForm> name="guardianPhone" label="Guardian Phone" />
                <div className="md:col-span-2">
                  <SubmitButton loading={createMut.isPending}>Create Student</SubmitButton>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      ) : null}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="pt-5">
          {isLoading ? (
            <Skeleton className="h-40" />
          ) : !data?.items.length ? (
            <EmptyState
              title="No students found"
              description="Add a student with their Google email to allow login."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Class</th>
                    <th className="pb-2 font-medium">Avg Score</th>
                    <th className="pb-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100">
                      <td className="py-3 font-medium">{s.user.name}</td>
                      <td className="py-3 text-slate-600">{s.user.email}</td>
                      <td className="py-3">{s.className ?? "—"}</td>
                      <td className="py-3">{formatPercent(s.avgScore)}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Link href={`/admin/students/${s.id}`}>
                            <Button variant="secondary" size="sm">
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteId(s.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete student?"
        description="This will permanently remove the student and related records."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (deleteId) await deleteMut.mutateAsync(deleteId);
        }}
      />
    </div>
  );
}
