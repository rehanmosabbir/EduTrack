import { PageHeader } from "@/components/ui/page-header";

export default function TeacherSettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Application timezone is Asia/Dhaka. Deploy on Vercel with PostgreSQL."
      />
      <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
        <p>
          Manage students, homework, evaluations, and guardian communication from
          the teacher console. Private teacher notes never appear in student or
          guardian APIs.
        </p>
      </div>
    </div>
  );
}
