"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus, Search } from "lucide-react";
import {
  useDeleteNote,
  useNotes,
  useStudents,
  useSubjects,
  useUploadNote,
} from "@/hooks/use-server-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";
import { toast } from "sonner";

export default function AdminNotesPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignToAll, setAssignToAll] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [formSubjectId, setFormSubjectId] = useState("");

  const { data, isLoading } = useNotes({
    search: search || undefined,
    subjectId: subjectId || undefined,
    limit: 50,
  });
  const { data: subjects } = useSubjects({ limit: 100 });
  const { data: students } = useStudents({ limit: 100 });
  const uploadMut = useUploadNote();
  const deleteMut = useDeleteNote();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notes</h1>
          <p className="text-sm text-slate-500">Upload and assign study materials</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> Upload Note
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload Study Material</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <select
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                value={formSubjectId}
                onChange={(e) => setFormSubjectId(e.target.value)}
              >
                <option value="">None</option>
                {(subjects?.items ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>File</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.gif,.zip"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Assign to</Label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={assignToAll}
                  onChange={(e) => setAssignToAll(e.target.checked)}
                />
                All Students
              </label>
              {!assignToAll ? (
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-3">
                  {(students?.items ?? []).map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(s.id)}
                        onChange={(e) => {
                          setSelectedStudents((prev) =>
                            e.target.checked
                              ? [...prev, s.id]
                              : prev.filter((id) => id !== s.id),
                          );
                        }}
                      />
                      {s.user.name}
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
            <Button
              disabled={uploadMut.isPending}
              onClick={() => {
                if (!title || !file) {
                  toast.error("Title and file are required");
                  return;
                }
                const fd = new FormData();
                fd.append("title", title);
                if (description) fd.append("description", description);
                if (formSubjectId) fd.append("subjectId", formSubjectId);
                fd.append("assignToAll", String(assignToAll));
                fd.append("studentIds", JSON.stringify(selectedStudents));
                fd.append("file", file);
                uploadMut.mutate(fd, {
                  onSuccess: () => {
                    setShowForm(false);
                    setTitle("");
                    setDescription("");
                    setFile(null);
                    setAssignToAll(true);
                    setSelectedStudents([]);
                  },
                });
              }}
            >
              {uploadMut.isPending ? "Uploading..." : "Upload"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
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
      </div>

      <Card>
        <CardContent className="pt-5">
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : !data?.items.length ? (
            <EmptyState title="No notes uploaded" />
          ) : (
            <div className="space-y-3">
              {data.items.map((n) => (
                <div
                  key={n.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">{n.title}</p>
                    <p className="text-sm text-slate-500">
                      {n.subject?.name ?? "General"} · {n.fileName} ·{" "}
                      {format(new Date(n.createdAt), "dd MMM yyyy")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(n.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete note?"
        description="The uploaded file will be removed."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (deleteId) await deleteMut.mutateAsync(deleteId);
        }}
      />
    </div>
  );
}
