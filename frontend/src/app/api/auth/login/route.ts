import { withApi, jsonSuccess, parseJsonBody } from "@/server/api/http";
import * as authService from "@/server/services/auth.service";
import { loginSchema } from "@/server/validators/schemas";

export const POST = withApi(async (req) => {
  const body = await parseJsonBody(req, loginSchema);
  const result = await authService.loginWithPassword(body);
  return jsonSuccess(result);
});
