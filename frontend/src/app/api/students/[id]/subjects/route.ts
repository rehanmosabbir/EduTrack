import { withApi, jsonSuccess } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import * as studentService from "@/server/services/student.service";
import { ROLES } from "@/server/utils/constants";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  subjectIds: z.array(z.string()),
});

export const PUT = withApi(async (req, ctx: Ctx) => {
  const user = await requireAuth(req, [ROLES.TEACHER]);
  const { id } = await ctx.params;
  const body = bodySchema.parse(await req.json());
  const student = await studentService.setStudentSubjects(
    id,
    body.subjectIds,
    user.id,
  );
  return jsonSuccess(student);
});
