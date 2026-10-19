import {
  withApi,
  jsonSuccess,
  parseJsonBody,
  getSearchParams,
} from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import * as guardianService from "@/server/services/guardian.service";
import { createGuardianSchema } from "@/server/validators/schemas";
import { ROLES } from "@/server/utils/constants";

export const GET = withApi(async (req) => {
  await requireAuth(req, [ROLES.TEACHER]);
  const q = getSearchParams(req);
  const result = await guardianService.listGuardians({
    page: Number(q.page ?? 1),
    limit: Number(q.limit ?? 20),
    search: q.search,
  });
  return jsonSuccess(result.items, 200, result.meta);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, [ROLES.TEACHER]);
  const body = await parseJsonBody(req, createGuardianSchema);
  const guardian = await guardianService.createGuardian(body, user.id);
  return jsonSuccess(guardian, 201);
});
