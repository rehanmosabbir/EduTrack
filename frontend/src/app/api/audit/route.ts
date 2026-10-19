import { withApi, jsonSuccess, getSearchParams } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import * as auditService from "@/server/services/audit.service";
import { ROLES } from "@/server/utils/constants";

export const GET = withApi(async (req) => {
  await requireAuth(req, [ROLES.TEACHER]);
  const q = getSearchParams(req);
  const result = await auditService.listAuditLogs({
    entityType: q.entityType,
    entityId: q.entityId,
    page: Number(q.page ?? 1),
    limit: Number(q.limit ?? 20),
  });
  return jsonSuccess(result.items, 200, result.meta);
});
