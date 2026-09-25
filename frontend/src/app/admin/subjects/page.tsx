"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Plus } from "lucide-react";
import {
  useCreateSubject,
  useDeleteSubject,
  useSubjects,
} from "@/hooks/use-server-state";
import { subjectFormSchema } from "@/validations/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput, FormTextarea, SubmitButton } from "@/components/forms/form-fields";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";

type SubjectForm = z.infer<typeof subjectFormSchema>;

export default function SubjectsPage() {
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading } = useSubjects({ limit: 100 });
  const createMut = useCreateSubject();
  const deleteMut = useDeleteSubject();

  const form = useForm<SubjectForm>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: { name: "", code: "", description: "" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subjects</h1>
          <p className="text-sm text-slate-500">Manage academic subjects</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> Add Subject
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>New Subject</CardTitle>
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
                <FormInput<SubjectForm> name="name" label="Name" />
                <FormInput<SubjectForm> name="code" label="Code" />
                <FormTextarea<SubjectForm>
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

      <Card>
        <CardContent className="pt-5">
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : !data?.items.length ? (
            <EmptyState title="No subjects yet" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{s.name}</p>
                      <p className="text-xs text-indigo-600">{s.code}</p>
                      <p className="mt-2 text-sm text-slate-500">
                        {s.description || "No description"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(s.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete subject?"
        description="Subjects with existing scores cannot be deleted."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (deleteId) await deleteMut.mutateAsync(deleteId);
        }}
      />
    </div>
  );
}
