import { withApi, jsonSuccess, parseJsonBody } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import * as guardianService from "@/server/services/guardian.service";
import { linkGuardianSchema } from "@/server/validators/schemas";
import { ROLES } from "@/server/utils/constants";

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, [ROLES.TEACHER]);
  const body = await parseJsonBody(req, linkGuardianSchema);
  const link = await guardianService.linkGuardian(body, user.id);
  return jsonSuccess(link, 201);
});
