"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useChangePassword,
  useMe,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useUpdateProfile,
} from "@/hooks/use-server-state";
import type { NotificationPreferences } from "@/services/api";

const APP_TIMEZONE = "Asia/Dhaka";

const PREF_LABELS: Array<{
  key: keyof Omit<NotificationPreferences, "id" | "userId">;
  label: string;
  description: string;
}> = [
  {
    key: "inAppEnabled",
    label: "In-app notifications",
    description: "Show alerts inside EduTrack",
  },
  {
    key: "emailEnabled",
    label: "Email notifications",
    description: "Send email alerts when available",
  },
  {
    key: "homeworkAssigned",
    label: "Homework assigned",
    description: "When homework is assigned to a student",
  },
  {
    key: "homeworkDueSoon",
    label: "Homework due soon",
    description: "Reminders before homework due dates",
  },
  {
    key: "evaluationRecorded",
    label: "Evaluations recorded",
    description: "When a lesson evaluation is saved",
  },
  {
    key: "guardianComment",
    label: "Guardian comments",
    description: "When a guardian posts a new comment",
  },
  {
    key: "teacherReply",
    label: "Teacher replies",
    description: "When you reply in a comment thread",
  },
];

export default function TeacherSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const { data: me, isLoading: meLoading } = useMe();
  const { data: prefs, isLoading: prefsLoading } = useNotificationPreferences();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const updatePrefs = useUpdateNotificationPreferences();

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences | null>(
    null,
  );

  useEffect(() => {
    if (me?.name) setName(me.name);
  }, [me?.name]);

  useEffect(() => {
    if (prefs) setLocalPrefs(prefs);
  }, [prefs]);

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    const updated = await updateProfile.mutateAsync({ name: name.trim() });
    await updateSession({ name: updated.name });
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    await changePassword.mutateAsync({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function onSavePrefs(e: React.FormEvent) {
    e.preventDefault();
    if (!localPrefs) return;
    const {
      inAppEnabled,
      emailEnabled,
      homeworkAssigned,
      homeworkDueSoon,
      evaluationRecorded,
      guardianComment,
      teacherReply,
    } = localPrefs;
    await updatePrefs.mutateAsync({
      inAppEnabled,
      emailEnabled,
      homeworkAssigned,
      homeworkDueSoon,
      evaluationRecorded,
      guardianComment,
      teacherReply,
    });
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your profile, password, and notification preferences"
      />

      <div className="grid max-w-2xl gap-6">
        <section className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Profile</h2>
          <p className="mt-1 text-xs text-slate-500">
            Role: {session?.user?.role ?? me?.role ?? "—"} · Timezone:{" "}
            {APP_TIMEZONE}
          </p>
          {meLoading ? (
            <p className="mt-4 text-sm text-slate-500">Loading…</p>
          ) : (
            <form className="mt-4 space-y-3" onSubmit={onSaveProfile}>
              <div>
                <Label htmlFor="settings-name">Full name</Label>
                <Input
                  id="settings-name"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="settings-email">Email</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={me?.email ?? ""}
                  disabled
                />
                <p className="mt-1 text-xs text-slate-400">
                  Email cannot be changed here.
                </p>
              </div>
              <Button type="submit" disabled={updateProfile.isPending}>
                Save profile
              </Button>
            </form>
          )}
        </section>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Change password
          </h2>
          <form className="mt-4 space-y-3" onSubmit={onChangePassword}>
            <div>
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={changePassword.isPending}>
              Update password
            </Button>
          </form>
        </section>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Notifications
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Control which alerts you receive. Private teacher notes are never
            shown to students or guardians.
          </p>
          {prefsLoading || !localPrefs ? (
            <p className="mt-4 text-sm text-slate-500">Loading…</p>
          ) : (
            <form className="mt-4 space-y-3" onSubmit={onSavePrefs}>
              {PREF_LABELS.map((item) => (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    className="mt-1 cursor-pointer"
                    checked={Boolean(localPrefs[item.key])}
                    onChange={(e) =>
                      setLocalPrefs({
                        ...localPrefs,
                        [item.key]: e.target.checked,
                      })
                    }
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-800">
                      {item.label}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {item.description}
                    </span>
                  </span>
                </label>
              ))}
              <Button type="submit" disabled={updatePrefs.isPending}>
                Save notification preferences
              </Button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
