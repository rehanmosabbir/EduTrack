import { withApi, jsonSuccess, parseJsonBody } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import * as authService from "@/server/services/auth.service";
import { changePasswordSchema } from "@/server/validators/schemas";

export const POST = withApi(async (req) => {
  const user = await requireAuth(req);
  const body = await parseJsonBody(req, changePasswordSchema);
  const result = await authService.changePassword(user.id, {
    currentPassword: body.currentPassword,
    newPassword: body.newPassword,
  });
  return jsonSuccess(result);
});
