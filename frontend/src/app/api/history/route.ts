import { withApi, jsonSuccess, getSearchParams } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import { assertCanAccessStudent } from "@/server/auth/authorize";
import * as evaluationService from "@/server/services/evaluation.service";
import { serializeEvaluations } from "@/server/services/serializers";
import { historyQuerySchema } from "@/server/validators/schemas";
import { Errors } from "@/server/utils/AppError";
import { ROLES } from "@/server/utils/constants";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req);
  const q = getSearchParams(req);
  const parsed = historyQuerySchema.parse({
    ...q,
    studentId:
      user.role === ROLES.STUDENT
        ? user.studentId
        : q.studentId,
  });

  if (!parsed.studentId) throw Errors.validation("studentId is required");
  await assertCanAccessStudent(user, parsed.studentId);

  const result = await evaluationService.listEvaluations(parsed);
  return jsonSuccess(
    serializeEvaluations(result.items, user.role),
    200,
    result.meta,
  );
});
