"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateComment,
  useStudents,
  useUnansweredComments,
  useComments,
} from "@/hooks/use-server-state";
import { formatDate } from "@/lib/format";

export default function TeacherCommentsPage() {
  const { data: unanswered } = useUnansweredComments();
  const { data: students } = useStudents({ limit: 100 });
  const [studentId, setStudentId] = useState("");
  const { data: threads } = useComments({ studentId }, !!studentId);
  const create = useCreateComment();
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  return (
    <div>
      <PageHeader
        title="Guardian comments"
        description="Reply to guardian questions about student progress"
      />

      <section className="mb-6 rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Unanswered</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(unanswered ?? []).length === 0 ? (
            <li className="text-slate-500">No unanswered comments.</li>
          ) : (
            (unanswered ?? []).map((c) => (
              <li key={c.id} className="border-b py-2 last:border-0">
                <p className="font-medium">
                  {c.student?.fullName} — {c.guardian?.user.name}
                </p>
                <p className="text-slate-600">{c.message}</p>
                <p className="text-xs text-slate-400">{formatDate(c.createdAt)}</p>
              </li>
            ))
          )}
        </ul>
      </section>

      <select
        className="mb-4 w-full max-w-md rounded-md border px-3 py-2 text-sm"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      >
        <option value="">View conversation by student</option>
        {(students?.items ?? []).map((s) => (
          <option key={s.id} value={s.id}>
            {s.fullName}
          </option>
        ))}
      </select>

      <ul className="space-y-4">
        {(threads?.items ?? []).map((t) => (
          <li key={t.id} className="rounded-xl border bg-white p-4 text-sm">
            <p className="font-medium">{t.guardian?.user.name ?? "Guardian"}</p>
            <p className="mt-1">{t.message}</p>
            <ul className="mt-3 space-y-2 border-l-2 border-teal-100 pl-3">
              {(t.replies ?? []).map((r) => (
                <li key={r.id}>
                  <span className="font-medium text-teal-800">
                    {r.authorRole === "TEACHER" ? "Teacher" : "Guardian"}:
                  </span>{" "}
                  {r.message}
                </li>
              ))}
            </ul>
            {replyFor === t.id ? (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button
                  size="sm"
                  disabled={create.isPending}
                  onClick={async () => {
                    await create.mutateAsync({
                      studentId,
                      message,
                      parentCommentId: t.id,
                    });
                    setMessage("");
                    setReplyFor(null);
                  }}
                >
                  Send reply
                </Button>
              </div>
            ) : (
              <Button
                className="mt-3"
                size="sm"
                variant="outline"
                onClick={() => setReplyFor(t.id)}
              >
                Reply
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
