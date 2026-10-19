import { withApi, jsonSuccess, getSearchParams } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import * as notificationService from "@/server/services/notification.service";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req);
  const q = getSearchParams(req);
  const result = await notificationService.listNotifications(
    user.id,
    Number(q.page ?? 1),
    Number(q.limit ?? 20),
  );
  return jsonSuccess(result.items, 200, result.meta);
});
