import { withApi, jsonSuccess } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import * as guardianService from "@/server/services/guardian.service";
import { ROLES } from "@/server/utils/constants";
import { z } from "zod";

const schema = z.object({
  studentId: z.string().min(1),
  guardianId: z.string().min(1),
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, [ROLES.TEACHER]);
  const body = schema.parse(await req.json());
  const result = await guardianService.unlinkGuardian(
    body.studentId,
    body.guardianId,
    user.id,
  );
  return jsonSuccess(result);
});
