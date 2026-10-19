import { withApi, jsonSuccess } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import * as dashboardService from "@/server/services/dashboard.service";
import { ROLES } from "@/server/utils/constants";

export const GET = withApi(async (req) => {
  await requireAuth(req, [ROLES.TEACHER]);
  return jsonSuccess(await dashboardService.getTeacherDashboard());
});
