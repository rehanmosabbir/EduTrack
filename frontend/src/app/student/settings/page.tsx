"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentSettingsPage() {
  const { data: session } = useSession();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-slate-500">Account preferences</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Signed in as</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>{session?.user?.name}</p>
          <p className="text-slate-500">{session?.user?.email}</p>
        </CardContent>
      </Card>
    </div>
  );
}
