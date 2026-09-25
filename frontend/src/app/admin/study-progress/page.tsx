"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import type { z } from "zod";
import {
  useDeleteStudyLog,
  useStudents,
  useStudyLogs,
  useStudyTrend,
  useUpsertStudyLog,
} from "@/hooks/use-server-state";
import { studyLogSchema } from "@/validations/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormDatePicker,
  FormInput,
  FormSelect,
  FormTextarea,
  SubmitButton,
} from "@/components/forms/form-fields";
import { StudyHoursChart } from "@/components/charts/charts";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/empty-state";

type StudyForm = z.infer<typeof studyLogSchema>;

export default function AdminStudyProgressPage() {
  const [studentId, setStudentId] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: students } = useStudents({ limit: 100 });
  const { data: logs, isLoading } = useStudyLogs({
    studentId: studentId || undefined,
    limit: 40,
  });
  const { data: trend } = useStudyTrend({
    studentId: studentId || undefined,
    days: 21,
  });
  const saveMut = useUpsertStudyLog();
  const deleteMut = useDeleteStudyLog();

  const form = useForm<StudyForm>({
    resolver: zodResolver(studyLogSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      studyHours: 2,
      studyMinutes: 0,
      description: "",
      studentId: "",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Study Progress</h1>
        <p className="text-sm text-slate-500">
          Track and edit daily study hours for students
        </p>
      </div>

      <div className="max-w-sm">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Filter by student
        </label>
        <select
          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        >
          <option value="">All students</option>
          {(students?.items ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.user.name}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Study Hours Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <StudyHoursChart data={trend ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add / Update Study Log</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={form.handleSubmit((v) => saveMut.mutate(v))}
            >
              <FormSelect<StudyForm>
                name="studentId"
                label="Student"
                options={(students?.items ?? []).map((s) => ({
                  value: s.id,
                  label: s.user.name,
                }))}
              />
              <FormDatePicker<StudyForm> name="date" label="Date" />
              <FormInput<StudyForm> name="studyHours" label="Hours" type="number" />
              <FormInput<StudyForm> name="studyMinutes" label="Minutes" type="number" />
              <FormTextarea<StudyForm>
                name="description"
                label="What did they study?"
                className="md:col-span-2"
              />
              <SubmitButton loading={saveMut.isPending}>Save Study Log</SubmitButton>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Study Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="pb-2 font-medium">Student</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Duration</th>
                    <th className="pb-2 font-medium">Description</th>
                    <th className="pb-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(logs?.items ?? []).map((l) => (
                    <tr key={l.id} className="border-b border-slate-100">
                      <td className="py-2.5">{l.student?.user.name}</td>
                      <td className="py-2.5">{l.date.slice(0, 10)}</td>
                      <td className="py-2.5">
                        {l.studyHours}h {l.studyMinutes}m
                      </td>
                      <td className="max-w-xs truncate py-2.5">{l.description}</td>
                      <td className="py-2.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteId(l.id)}
                        >
                          Delete
                        </Button>
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
        title="Delete study log?"
        description="This study record will be removed."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (deleteId) await deleteMut.mutateAsync(deleteId);
        }}
      />
    </div>
  );
}
