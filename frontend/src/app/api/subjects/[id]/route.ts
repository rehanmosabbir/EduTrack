import { withApi, jsonSuccess, parseJsonBody } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import * as subjectService from "@/server/services/subject.service";
import { updateSubjectSchema } from "@/server/validators/schemas";
import { ROLES } from "@/server/utils/constants";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withApi(async (req, ctx: Ctx) => {
  await requireAuth(req);
  const { id } = await ctx.params;
  return jsonSuccess(await subjectService.getSubject(id));
});

export const PUT = withApi(async (req, ctx: Ctx) => {
  await requireAuth(req, [ROLES.TEACHER]);
  const { id } = await ctx.params;
  const body = await parseJsonBody(req, updateSubjectSchema);
  return jsonSuccess(await subjectService.updateSubject(id, body));
});
