"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-slate-500">Account and application preferences</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-slate-500">Name:</span> {session?.user?.name}
          </p>
          <p>
            <span className="text-slate-500">Email:</span> {session?.user?.email}
          </p>
          <p>
            <span className="text-slate-500">Role:</span> {session?.user?.role}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Grading System</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          <p>A+ ≥ 80 · A ≥ 70 · A- ≥ 60 · B ≥ 50 · C ≥ 40 · D ≥ 33 · F &lt; 33</p>
          <p className="mt-2 text-xs text-slate-400">
            Bangladesh HSC-style bands (configurable in backend constants).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
