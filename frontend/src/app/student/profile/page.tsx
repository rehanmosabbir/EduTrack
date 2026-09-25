"use client";

import { useMyProfile } from "@/hooks/use-server-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/empty-state";

export default function StudentProfilePage() {
  const { data, isLoading } = useMyProfile();

  if (isLoading) return <Skeleton className="h-40" />;
  if (!data) return <p className="text-sm text-red-600">Profile not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-slate-500">Your student information</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{data.user.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <Field label="Email" value={data.user.email} />
          <Field label="Student ID" value={data.studentId} />
          <Field label="Class" value={data.className ?? "—"} />
          <Field label="Institution" value={data.institution ?? "—"} />
          <Field label="Phone" value={data.phone ?? "—"} />
          <Field label="Guardian" value={data.guardianName ?? "—"} />
          <Field label="Guardian Phone" value={data.guardianPhone ?? "—"} />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="font-medium text-slate-900">{value}</p>
    </div>
  );
}
