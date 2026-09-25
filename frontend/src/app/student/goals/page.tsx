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
  useUpdateGoal,
} from "@/hooks/use-server-state";
import { goalFormSchema } from "@/validations/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormDatePicker,
  FormInput,
  FormTextarea,
  SubmitButton,
} from "@/components/forms/form-fields";
import { Progress } from "@/components/ui/progress";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";

type GoalForm = z.infer<typeof goalFormSchema>;

export default function StudentGoalsPage() {
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading } = useGoals({ limit: 50 });
  const createMut = useCreateGoal();
  const updateMut = useUpdateGoal();
  const deleteMut = useDeleteGoal();

  const form = useForm<GoalForm>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: "",
      description: "",
      targetValue: 5,
      currentValue: 0,
      deadline: "",
    },
  });

  const groups = {
    ACTIVE: data?.items.filter((g) => g.status === "ACTIVE") ?? [],
    COMPLETED: data?.items.filter((g) => g.status === "COMPLETED") ?? [],
    OVERDUE: data?.items.filter((g) => g.status === "OVERDUE") ?? [],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Goals</h1>
          <p className="text-sm text-slate-500">Track your study targets</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> New Goal
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Create Goal</CardTitle>
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
                <FormInput<GoalForm> name="title" label="Goal" />
                <FormInput<GoalForm>
                  name="targetValue"
                  label="Target"
                  type="number"
                />
                <FormInput<GoalForm>
                  name="currentValue"
                  label="Current"
                  type="number"
                />
                <FormDatePicker<GoalForm> name="deadline" label="Deadline" />
                <FormTextarea<GoalForm>
                  name="description"
                  label="Description"
                  className="md:col-span-2"
                />
                <SubmitButton loading={createMut.isPending}>Create</SubmitButton>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-32" />
      ) : !data?.items.length ? (
        <EmptyState
          title="No goals yet"
          description="Create a daily study goal to get started."
        />
      ) : (
        (["ACTIVE", "COMPLETED", "OVERDUE"] as const).map((status) =>
          groups[status].length ? (
            <div key={status} className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {status}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {groups[status].map((g) => {
                  const pct = Math.min(
                    100,
                    Math.round((g.currentValue / g.targetValue) * 100),
                  );
                  return (
                    <Card key={g.id}>
                      <CardContent className="space-y-3 pt-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{g.title}</p>
                            <p className="text-sm text-slate-500">
                              Target: {g.targetValue} · Current: {g.currentValue}
                              {g.deadline
                                ? ` · Deadline: ${g.deadline.slice(0, 10)}`
                                : ""}
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
                        <Progress value={pct} />
                        <p className="text-xs text-slate-400">Progress: {pct}%</p>
                        {status === "ACTIVE" ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              updateMut.mutate({
                                id: g.id,
                                payload: {
                                  currentValue: Number(
                                    (g.currentValue + 0.5).toFixed(1),
                                  ),
                                },
                              })
                            }
                          >
                            +0.5 progress
                          </Button>
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : null,
        )
      )}

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
