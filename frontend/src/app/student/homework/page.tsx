"use client";

import { PageHeader } from "@/components/ui/page-header";
import { useHomework } from "@/hooks/use-server-state";
import { formatDate } from "@/lib/format";

export default function StudentHomeworkPage() {
  const { data, isLoading } = useHomework({ limit: 50 });

  return (
    <div>
      <PageHeader
        title="My homework"
        description="Assignments given to you individually (read-only)"
      />
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (data?.items ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">No homework assignments.</p>
        ) : (
          data!.items.map((h) => (
            <article key={h.id} className="rounded-xl border bg-white p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">{h.title}</h2>
                <span className="text-slate-500">{h.status}</span>
              </div>
              <p className="mt-1 text-slate-600">
                {h.subject?.name} · {h.lessonOrChapter}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{h.instructions}</p>
              <p className="mt-2 text-xs text-slate-500">
                Assigned {formatDate(h.assignedAt)}
                {h.dueDate ? ` · Due ${formatDate(h.dueDate)}` : ""}
                {h.maximumMarks != null ? ` · Max ${h.maximumMarks}` : ""}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
