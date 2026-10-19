"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { useGuardianDashboard, useHomework } from "@/hooks/use-server-state";
import { formatDate } from "@/lib/format";

export default function GuardianHomeworkPage() {
  const { data: dash } = useGuardianDashboard();
  const children =
    (dash?.children as Array<{ id: string; fullName: string }>) ?? [];
  const [studentId, setStudentId] = useState("");
  const effectiveId = studentId || children[0]?.id;
  const { data, isLoading } = useHomework(
    effectiveId ? { studentId: effectiveId, limit: 50 } : { limit: 0 },
  );

  return (
    <div>
      <PageHeader
        title="Children's homework"
        description="Individual assignments for your linked children"
      />
      <select
        className="mb-4 w-full max-w-md rounded-md border px-3 py-2 text-sm"
        value={effectiveId ?? ""}
        onChange={(e) => setStudentId(e.target.value)}
      >
        {children.map((c) => (
          <option key={c.id} value={c.id}>
            {c.fullName}
          </option>
        ))}
      </select>
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          (data?.items ?? []).map((h) => (
            <article key={h.id} className="rounded-xl border bg-white p-4 text-sm">
              <h2 className="font-semibold">{h.title}</h2>
              <p className="text-slate-600">
                {h.subject?.name} · Due {formatDate(h.dueDate)}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{h.instructions}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
