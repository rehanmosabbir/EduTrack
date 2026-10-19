import { withApi, jsonSuccess, parseJsonBody } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import * as notificationService from "@/server/services/notification.service";
import { updateNotificationPrefsSchema } from "@/server/validators/schemas";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req);
  const prefs = await notificationService.getOrCreatePreferences(user.id);
  return jsonSuccess(prefs);
});

export const PUT = withApi(async (req) => {
  const user = await requireAuth(req);
  const body = await parseJsonBody(req, updateNotificationPrefsSchema);
  const prefs = await notificationService.updatePreferences(user.id, body);
  return jsonSuccess(prefs);
});
