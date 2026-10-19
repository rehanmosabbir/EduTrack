import {
  withApi,
  jsonSuccess,
  parseJsonBody,
  getSearchParams,
} from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import {
  assertCanAccessStudent,
  getAccessibleStudentIds,
} from "@/server/auth/authorize";
import * as homeworkService from "@/server/services/homework.service";
import { homeworkSchema } from "@/server/validators/schemas";
import { ROLES } from "@/server/utils/constants";
import type { HomeworkAssignmentStatus } from "@prisma/client";
import { Errors } from "@/server/utils/AppError";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req);
  const q = getSearchParams(req);
  let studentId: string | undefined = q.studentId || undefined;

  if (user.role === ROLES.STUDENT) {
    if (!user.studentId) throw Errors.forbidden("No student profile");
    studentId = user.studentId;
  } else if (user.role === ROLES.GUARDIAN) {
    if (!studentId) {
      const ids = await getAccessibleStudentIds(user);
      studentId = Array.isArray(ids) ? ids[0] : undefined;
    }
    const accessibleId = studentId;
    if (accessibleId) await assertCanAccessStudent(user, accessibleId);
  }

  const result = await homeworkService.listHomework({
    studentId,
    subjectId: q.subjectId,
    status: q.status as HomeworkAssignmentStatus | undefined,
    from: q.from,
    to: q.to,
    page: Number(q.page ?? 1),
    limit: Number(q.limit ?? 20),
  });
  return jsonSuccess(result.items, 200, result.meta);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, [ROLES.TEACHER]);
  const body = await parseJsonBody(req, homeworkSchema);
  const hw = await homeworkService.createHomework(body, user.id);
  return jsonSuccess(hw, 201);
});
