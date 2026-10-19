"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSubject, useSubjects } from "@/hooks/use-server-state";

export default function TeacherSubjectsPage() {
  const { data, isLoading } = useSubjects();
  const create = useCreateSubject();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div>
      <PageHeader title="Subjects" description="Subjects taught in your coaching" />
      <form
        className="mb-6 grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await create.mutateAsync({ name, description: description || null });
          setName("");
          setDescription("");
        }}
      >
        <div>
          <Label>Name</Label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Description</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={create.isPending}>
            Add subject
          </Button>
        </div>
      </form>
      <ul className="space-y-2">
        {isLoading ? (
          <li className="text-sm text-slate-500">Loading…</li>
        ) : (
          (data ?? []).map((s) => (
            <li
              key={s.id}
              className="rounded-xl border bg-white px-4 py-3 text-sm"
            >
              <span className="font-medium">{s.name}</span>
              <span className="ml-2 text-slate-500">{s.status}</span>
              {s.description ? (
                <p className="mt-1 text-slate-500">{s.description}</p>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
