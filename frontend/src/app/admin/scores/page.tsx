"use client";

import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import type { z } from "zod";
import { Plus } from "lucide-react";
import {
  useDeleteScore,
  useSaveScore,
  useScores,
  useStudents,
  useSubjects,
} from "@/hooks/use-server-state";
import { scoreFormSchema } from "@/validations/schemas";
import { formatPercent } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormDatePicker,
  FormInput,
  FormSelect,
  FormTextarea,
  SubmitButton,
} from "@/components/forms/form-fields";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";

type ScoreForm = z.infer<typeof scoreFormSchema>;

export default function AdminScoresPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: scores, isLoading } = useScores({ limit: 50 });
  const { data: students } = useStudents({ limit: 100 });
  const { data: subjects } = useSubjects({ limit: 100 });
  const saveMut = useSaveScore();
  const deleteMut = useDeleteScore();

  const form = useForm<ScoreForm>({
    resolver: zodResolver(scoreFormSchema),
    defaultValues: {
      studentId: "",
      subjectId: "",
      examName: "",
      examDate: format(new Date(), "yyyy-MM-dd"),
      obtainedMarks: 0,
      totalMarks: 50,
      remarks: "",
    },
  });

  const obtained = form.watch("obtainedMarks");
  const total = form.watch("totalMarks");
  const previewPct = useMemo(() => {
    if (!total || total <= 0) return 0;
    return Math.round((Number(obtained) / Number(total)) * 10000) / 100;
  }, [obtained, total]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scores</h1>
          <p className="text-sm text-slate-500">Add and update academic scores</p>
        </div>
        <Button
          onClick={() => {
            setEditId(null);
            form.reset({
              studentId: "",
              subjectId: "",
              examName: "",
              examDate: format(new Date(), "yyyy-MM-dd"),
              obtainedMarks: 0,
              totalMarks: 50,
              remarks: "",
            });
            setShowForm((v) => !v);
          }}
        >
          <Plus className="h-4 w-4" /> Add Score
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{editId ? "Edit Score" : "New Score"}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormProvider {...form}>
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={form.handleSubmit((v) =>
                  saveMut.mutate(
                    { id: editId, values: v },
                    {
                      onSuccess: () => {
                        setShowForm(false);
                        setEditId(null);
                        form.reset();
                      },
                    },
                  ),
                )}
              >
                <FormSelect<ScoreForm>
                  name="studentId"
                  label="Student"
                  options={(students?.items ?? []).map((s) => ({
                    value: s.id,
                    label: s.user.name,
                  }))}
                />
                <FormSelect<ScoreForm>
                  name="subjectId"
                  label="Subject"
                  options={(subjects?.items ?? []).map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                />
                <FormInput<ScoreForm> name="examName" label="Exam / Test Name" />
                <FormDatePicker<ScoreForm> name="examDate" label="Exam Date" />
                <FormInput<ScoreForm>
                  name="obtainedMarks"
                  label="Obtained Marks"
                  type="number"
                />
                <FormInput<ScoreForm>
                  name="totalMarks"
                  label="Total Marks"
                  type="number"
                />
                <div className="rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700 md:col-span-2">
                  Percentage preview: <strong>{previewPct}%</strong>
                </div>
                <FormTextarea<ScoreForm>
                  name="remarks"
                  label="Remarks"
                  className="md:col-span-2"
                />
                <SubmitButton loading={saveMut.isPending}>
                  {editId ? "Update Score" : "Save Score"}
                </SubmitButton>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="pt-5">
          {isLoading ? (
            <Skeleton className="h-40" />
          ) : !scores?.items.length ? (
            <EmptyState title="No scores yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="pb-2 font-medium">Student</th>
                    <th className="pb-2 font-medium">Subject</th>
                    <th className="pb-2 font-medium">Exam</th>
                    <th className="pb-2 font-medium">Marks</th>
                    <th className="pb-2 font-medium">%</th>
                    <th className="pb-2 font-medium">Grade</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.items.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100">
                      <td className="py-2.5">{s.student?.user.name}</td>
                      <td className="py-2.5">{s.subject?.name}</td>
                      <td className="py-2.5">{s.examName}</td>
                      <td className="py-2.5">
                        {s.obtainedMarks}/{s.totalMarks}
                      </td>
                      <td className="py-2.5 font-medium text-indigo-700">
                        {formatPercent(s.percentage)}
                      </td>
                      <td className="py-2.5">{s.grade}</td>
                      <td className="py-2.5">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setEditId(s.id);
                              form.reset({
                                studentId: s.studentId,
                                subjectId: s.subjectId,
                                examName: s.examName,
                                examDate: s.examDate.slice(0, 10),
                                obtainedMarks: s.obtainedMarks,
                                totalMarks: s.totalMarks,
                                remarks: s.remarks ?? "",
                              });
                              setShowForm(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
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
        title="Delete score?"
        description="This score record will be permanently removed."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (deleteId) await deleteMut.mutateAsync(deleteId);
        }}
      />
    </div>
  );
}
