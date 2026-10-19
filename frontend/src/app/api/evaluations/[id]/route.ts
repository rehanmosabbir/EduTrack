import { withApi, jsonSuccess, parseJsonBody } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import { assertCanAccessStudent } from "@/server/auth/authorize";
import * as evaluationService from "@/server/services/evaluation.service";
import { serializeEvaluation } from "@/server/services/serializers";
import { updateEvaluationSchema } from "@/server/validators/schemas";
import { ROLES } from "@/server/utils/constants";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withApi(async (req, ctx: Ctx) => {
  const user = await requireAuth(req);
  const { id } = await ctx.params;
  const evaluation = await evaluationService.getEvaluation(id);
  await assertCanAccessStudent(user, evaluation.studentId);
  return jsonSuccess(serializeEvaluation(evaluation, user.role));
});

export const PUT = withApi(async (req, ctx: Ctx) => {
  const user = await requireAuth(req, [ROLES.TEACHER]);
  const { id } = await ctx.params;
  const body = await parseJsonBody(req, updateEvaluationSchema);
  const evaluation = await evaluationService.updateEvaluation(
    id,
    body,
    user.id,
  );
  return jsonSuccess(evaluation);
});
