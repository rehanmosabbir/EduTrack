import { withApi, jsonSuccess, getSearchParams } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import { assertCanAccessStudent } from "@/server/auth/authorize";
import * as dashboardService from "@/server/services/dashboard.service";
import { Errors } from "@/server/utils/AppError";
import { ROLES } from "@/server/utils/constants";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req);
  const q = getSearchParams(req);
  const studentId =
    user.role === ROLES.STUDENT ? user.studentId : q.studentId;
  if (!studentId) throw Errors.validation("studentId is required");
  await assertCanAccessStudent(user, studentId);
  const data = await dashboardService.getStudentDashboard(studentId);
  // Strip private notes from evaluations in nested payloads
  if (user.role !== ROLES.TEACHER && data.todayEvals) {
    data.todayEvals = data.todayEvals.map((e) => {
      const { privateTeacherNotes, ...rest } = e;
      void privateTeacherNotes;
      return rest;
    }) as typeof data.todayEvals;
  }
  if (user.role !== ROLES.TEACHER && data.recentFeedback) {
    data.recentFeedback = data.recentFeedback.map((e) => {
      const { privateTeacherNotes, ...rest } = e;
      void privateTeacherNotes;
      return rest;
    }) as typeof data.recentFeedback;
  }
  return jsonSuccess(data);
});
