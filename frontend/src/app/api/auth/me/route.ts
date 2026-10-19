import { withApi, jsonSuccess } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import * as authService from "@/server/services/auth.service";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req);
  const me = await authService.getMe(user.id);
  return jsonSuccess(me);
});
