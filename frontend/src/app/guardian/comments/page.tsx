"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useComments,
  useCreateComment,
  useGuardianDashboard,
} from "@/hooks/use-server-state";
import { formatDate } from "@/lib/format";

export default function GuardianCommentsPage() {
  const { data: dash } = useGuardianDashboard();
  const children =
    (dash?.children as Array<{ id: string; fullName: string }>) ?? [];
  const [studentId, setStudentId] = useState("");
  const effectiveId = studentId || children[0]?.id || "";
  const { data: threads } = useComments({ studentId: effectiveId }, !!effectiveId);
  const create = useCreateComment();
  const [message, setMessage] = useState("");

  return (
    <div>
      <PageHeader
        title="Comments"
        description="Ask the teacher about your child's progress"
      />
      <select
        className="mb-4 w-full max-w-md rounded-md border px-3 py-2 text-sm"
        value={effectiveId}
        onChange={(e) => setStudentId(e.target.value)}
      >
        {children.map((c) => (
          <option key={c.id} value={c.id}>
            {c.fullName}
          </option>
        ))}
      </select>

      {effectiveId ? (
        <form
          className="mb-6 space-y-2 rounded-xl border bg-white p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await create.mutateAsync({ studentId: effectiveId, message });
            setMessage("");
          }}
        >
          <Textarea
            required
            placeholder="Write a question or comment…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button type="submit" disabled={create.isPending}>
            Submit comment
          </Button>
        </form>
      ) : null}

      <ul className="space-y-4">
        {(threads?.items ?? []).map((t) => (
          <li key={t.id} className="rounded-xl border bg-white p-4 text-sm">
            <p>{t.message}</p>
            <p className="mt-1 text-xs text-slate-400">
              {formatDate(t.createdAt)}
            </p>
            <ul className="mt-3 space-y-2 border-l-2 border-teal-100 pl-3">
              {(t.replies ?? []).map((r) => (
                <li key={r.id}>
                  <strong>
                    {r.authorRole === "TEACHER" ? "Teacher" : "You"}:
                  </strong>{" "}
                  {r.message}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
