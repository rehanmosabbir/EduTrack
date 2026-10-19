import { withApi, jsonSuccess, parseJsonBody } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import { assertCanAccessStudent } from "@/server/auth/authorize";
import * as studentService from "@/server/services/student.service";
import { updateStudentSchema } from "@/server/validators/schemas";
import { ROLES } from "@/server/utils/constants";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withApi(async (req, ctx: Ctx) => {
  const user = await requireAuth(req);
  const { id } = await ctx.params;
  await assertCanAccessStudent(user, id);
  const student = await studentService.getStudent(id);
  return jsonSuccess(student);
});

export const PUT = withApi(async (req, ctx: Ctx) => {
  const user = await requireAuth(req, [ROLES.TEACHER]);
  const { id } = await ctx.params;
  const body = await parseJsonBody(req, updateStudentSchema);
  const student = await studentService.updateStudent(id, body, user.id);
  return jsonSuccess(student);
});
