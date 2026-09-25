"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import type { z } from "zod";
import { useStudyLogs, useUpsertStudyLog } from "@/hooks/use-server-state";
import { studyLogSchema } from "@/validations/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormDatePicker,
  FormInput,
  FormTextarea,
  SubmitButton,
} from "@/components/forms/form-fields";
import { Skeleton } from "@/components/ui/empty-state";

type StudyForm = z.infer<typeof studyLogSchema>;

export default function StudentStudyLogPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data, isLoading } = useStudyLogs({ limit: 30 });
  const saveMut = useUpsertStudyLog();

  const todayLog = data?.items.find((l) => l.date.slice(0, 10) === today);

  const form = useForm<StudyForm>({
    resolver: zodResolver(studyLogSchema),
    values: {
      date: today,
      studyHours: todayLog?.studyHours ?? 0,
      studyMinutes: todayLog?.studyMinutes ?? 0,
      description: todayLog?.description ?? "",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Study Log</h1>
        <p className="text-sm text-slate-500">
          Log today&apos;s study hours. You can edit today&apos;s entry.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={form.handleSubmit((v) =>
                saveMut.mutate({ ...v, date: today }),
              )}
            >
              <FormDatePicker<StudyForm> name="date" label="Date" />
              <div />
              <FormInput<StudyForm> name="studyHours" label="Study Hours" type="number" />
              <FormInput<StudyForm> name="studyMinutes" label="Study Minutes" type="number" />
              <FormTextarea<StudyForm>
                name="description"
                label="What did you study?"
                className="md:col-span-2"
                placeholder="Studied Physics chapter 3 and Mathematics algebra."
              />
              <SubmitButton loading={saveMut.isPending}>
                {todayLog ? "Update Today's Log" : "Save Study Log"}
              </SubmitButton>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Duration</th>
                    <th className="pb-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.items ?? []).map((l) => (
                    <tr key={l.id} className="border-b border-slate-100">
                      <td className="py-2.5">{l.date.slice(0, 10)}</td>
                      <td className="py-2.5">
                        {l.studyHours}h {l.studyMinutes}m
                      </td>
                      <td className="py-2.5">{l.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
