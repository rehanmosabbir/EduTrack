import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role === "TEACHER") redirect("/teacher/dashboard");
  if (session.user.role === "GUARDIAN") redirect("/guardian/dashboard");
  redirect("/student/dashboard");
}
