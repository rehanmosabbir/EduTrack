"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { useNotes, useSubjects } from "@/hooks/use-server-state";
import { downloadNote } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";

export default function StudentNotesPage() {
  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [fileType, setFileType] = useState("");

  const { data: subjects } = useSubjects({ limit: 100 });
  const { data, isLoading } = useNotes({
    search: search || undefined,
    subjectId: subjectId || undefined,
    fileType: fileType || undefined,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Notes</h1>
        <p className="text-sm text-slate-500">Download assigned study materials</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
        >
          <option value="">All subjects</option>
          {(subjects?.items ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
        >
          <option value="">All file types</option>
          <option value="pdf">PDF</option>
          <option value="word">DOC/DOCX</option>
          <option value="presentation">PPT</option>
          <option value="image">Images</option>
          <option value="zip">ZIP</option>
        </select>
      </div>

      <Card>
        <CardContent className="space-y-3 pt-5">
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : !data?.items.length ? (
            <EmptyState title="No notes assigned yet" />
          ) : (
            data.items.map((n) => (
              <div
                key={n.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                    {n.subject?.name ?? "General"}
                  </p>
                  <p className="font-medium text-slate-900">{n.fileName}</p>
                  <p className="text-xs text-slate-500">
                    {n.title} · {format(new Date(n.createdAt), "dd MMM yyyy")}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={async () => {
                    try {
                      await downloadNote(n.id, n.fileName);
                    } catch {
                      toast.error("Download failed");
                    }
                  }}
                >
                  <Download className="h-4 w-4" /> Download
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
