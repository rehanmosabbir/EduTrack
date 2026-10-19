import { withApi, jsonSuccess, getSearchParams } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import { assertCanAccessStudent } from "@/server/auth/authorize";
import * as progressService from "@/server/services/progress.service";
import { Errors } from "@/server/utils/AppError";
import { ROLES } from "@/server/utils/constants";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req);
  const q = getSearchParams(req);
  const studentId =
    user.role === ROLES.STUDENT ? user.studentId : q.studentId;
  if (!studentId) throw Errors.validation("studentId is required");
  await assertCanAccessStudent(user, studentId);
  const data = await progressService.getSubjectProgress(
    studentId,
    q.from,
    q.to,
  );
  return jsonSuccess(data);
});
