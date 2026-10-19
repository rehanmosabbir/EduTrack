import { withApi, jsonSuccess, getSearchParams } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import * as dashboardService from "@/server/services/dashboard.service";
import { Errors } from "@/server/utils/AppError";
import { ROLES } from "@/server/utils/constants";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, [ROLES.GUARDIAN]);
  if (!user.guardianId) throw Errors.forbidden();
  const q = getSearchParams(req);
  const data = await dashboardService.getGuardianDashboard(
    user.guardianId,
    q.studentId,
  );
  return jsonSuccess(data);
});
