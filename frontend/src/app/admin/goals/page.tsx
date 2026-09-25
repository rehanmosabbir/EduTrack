"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Plus } from "lucide-react";
import {
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useStudents,
} from "@/hooks/use-server-state";
import { goalFormSchema } from "@/validations/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormDatePicker,
  FormInput,
  FormSelect,
  FormTextarea,
  SubmitButton,
} from "@/components/forms/form-fields";
import { Progress } from "@/components/ui/progress";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";

type GoalForm = z.infer<typeof goalFormSchema>;

export default function AdminGoalsPage() {
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading } = useGoals({ limit: 50 });
  const { data: students } = useStudents({ limit: 100 });
  const createMut = useCreateGoal();
  const deleteMut = useDeleteGoal();

  const form = useForm<GoalForm>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: "",
      description: "",
      targetValue: 5,
      currentValue: 0,
      deadline: "",
      studentId: "",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Goals</h1>
          <p className="text-sm text-slate-500">Set and monitor study goals</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> Add Goal
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>New Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <FormProvider {...form}>
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={form.handleSubmit((v) =>
                  createMut.mutate(v, {
                    onSuccess: () => {
                      setShowForm(false);
                      form.reset();
                    },
                  }),
                )}
              >
                <FormSelect<GoalForm>
                  name="studentId"
                  label="Student"
                  options={(students?.items ?? []).map((s) => ({
                    value: s.id,
                    label: s.user.name,
                  }))}
                />
                <FormInput<GoalForm> name="title" label="Goal Title" />
                <FormInput<GoalForm>
                  name="targetValue"
                  label="Target Value"
                  type="number"
                />
                <FormInput<GoalForm>
                  name="currentValue"
                  label="Current Value"
                  type="number"
                />
                <FormDatePicker<GoalForm> name="deadline" label="Deadline" />
                <FormTextarea<GoalForm>
                  name="description"
                  label="Description"
                  className="md:col-span-2"
                />
                <SubmitButton loading={createMut.isPending}>Create Goal</SubmitButton>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <Skeleton className="h-32" />
        ) : !data?.items.length ? (
          <EmptyState title="No goals yet" />
        ) : (
          data.items.map((g) => {
            const pct = Math.min(
              100,
              Math.round((g.currentValue / g.targetValue) * 100),
            );
            return (
              <Card key={g.id}>
                <CardContent className="space-y-3 pt-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{g.title}</p>
                      <p className="text-xs text-slate-500">
                        {g.student?.user.name} · {g.status}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteId(g.id)}
                    >
                      Delete
                    </Button>
                  </div>
                  <p className="text-sm text-slate-600">
                    Current: {g.currentValue} / Target: {g.targetValue}
                  </p>
                  <Progress value={pct} />
                  <p className="text-xs text-slate-400">{pct}% complete</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete goal?"
        description="This goal will be removed."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (deleteId) await deleteMut.mutateAsync(deleteId);
        }}
      />
    </div>
  );
}
