import { withApi, jsonSuccess } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import * as guardianService from "@/server/services/guardian.service";
import { ROLES } from "@/server/utils/constants";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withApi(async (req, ctx: Ctx) => {
  const user = await requireAuth(req);
  const { id } = await ctx.params;
  if (user.role === ROLES.GUARDIAN && user.guardianId !== id) {
    return jsonSuccess(null);
  }
  if (user.role === ROLES.TEACHER || user.guardianId === id) {
    const guardian = await guardianService.getGuardian(id);
    return jsonSuccess(guardian);
  }
  await requireAuth(req, [ROLES.TEACHER]);
  return jsonSuccess(null);
});
