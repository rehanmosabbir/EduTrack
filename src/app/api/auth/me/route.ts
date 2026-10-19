import { withApi, jsonSuccess, parseJsonBody } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import * as authService from "@/server/services/auth.service";
import { updateProfileSchema } from "@/server/validators/schemas";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req);
  const me = await authService.getMe(user.id);
  return jsonSuccess(me);
});

export const PUT = withApi(async (req) => {
  const user = await requireAuth(req);
  const body = await parseJsonBody(req, updateProfileSchema);
  const updated = await authService.updateProfile(user.id, body);
  return jsonSuccess(updated);
});
