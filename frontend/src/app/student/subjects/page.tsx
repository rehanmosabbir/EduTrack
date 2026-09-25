"use client";

import { useSubjects } from "@/hooks/use-server-state";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";

export default function StudentSubjectsPage() {
  const { data, isLoading } = useSubjects({ limit: 100 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subjects</h1>
        <p className="text-sm text-slate-500">Your academic subjects</p>
      </div>
      {isLoading ? (
        <Skeleton className="h-32" />
      ) : !data?.items.length ? (
        <EmptyState title="No subjects" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((s) => (
            <Card key={s.id}>
              <CardContent className="pt-5">
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-indigo-600">{s.code}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {s.description || "No description"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
