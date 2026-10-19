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
import * as evaluationService from "@/server/services/evaluation.service";
import { serializeEvaluations } from "@/server/services/serializers";
import { evaluationSchema } from "@/server/validators/schemas";
import { ROLES } from "@/server/utils/constants";
import { Errors } from "@/server/utils/AppError";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req);
  const q = getSearchParams(req);
  let studentId: string | undefined = q.studentId || undefined;

  if (user.role === ROLES.STUDENT) {
    if (!user.studentId) throw Errors.forbidden();
    studentId = user.studentId;
  } else if (user.role === ROLES.GUARDIAN) {
    if (!studentId) {
      const ids = await getAccessibleStudentIds(user);
      studentId = Array.isArray(ids) ? ids[0] : undefined;
    }
    const accessibleId = studentId;
    if (accessibleId) await assertCanAccessStudent(user, accessibleId);
  }

  const result = await evaluationService.listEvaluations({
    studentId,
    subjectId: q.subjectId,
    from: q.from,
    to: q.to,
    lesson: q.lesson,
    preparationStatus: q.preparationStatus,
    homeworkStatus: q.homeworkStatus,
    page: Number(q.page ?? 1),
    limit: Number(q.limit ?? 20),
  });

  return jsonSuccess(
    serializeEvaluations(result.items, user.role),
    200,
    result.meta,
  );
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, [ROLES.TEACHER]);
  const body = await parseJsonBody(req, evaluationSchema);
  const evaluation = await evaluationService.createEvaluation(body, user.id);
  return jsonSuccess(evaluation, 201);
});
