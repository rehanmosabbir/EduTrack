"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { useHomework, useUpdateHomework } from "@/hooks/use-server-state";
import { formatDate } from "@/lib/format";

export default function TeacherHomeworkPage() {
  const { data, isLoading } = useHomework({ limit: 50 });
  const update = useUpdateHomework();

  return (
    <div>
      <PageHeader
        title="Homework"
        description="Individual assignments per student"
        actions={
          <Button asChild>
            <Link href="/teacher/homework/new">Assign homework</Link>
          </Button>
        }
      />
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Assigned</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : (data?.items ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-slate-500">
                  No homework yet.
                </td>
              </tr>
            ) : (
              data!.items.map((h) => (
                <tr key={h.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{h.student?.fullName}</td>
                  <td className="px-4 py-3">{h.subject?.name}</td>
                  <td className="px-4 py-3">{h.title}</td>
                  <td className="px-4 py-3">{formatDate(h.assignedAt)}</td>
                  <td className="px-4 py-3">{formatDate(h.dueDate)}</td>
                  <td className="px-4 py-3">{h.status}</td>
                  <td className="px-4 py-3 text-right">
                    {h.status === "ACTIVE" ? (
                      <button
                        className="text-teal-700 hover:underline"
                        onClick={() =>
                          update.mutate({
                            id: h.id,
                            payload: { status: "CANCELLED" },
                          })
                        }
                      >
                        Cancel
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
