import { withApi, jsonSuccess, parseJsonBody } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import { assertCanAccessStudent } from "@/server/auth/authorize";
import * as homeworkService from "@/server/services/homework.service";
import { updateHomeworkSchema } from "@/server/validators/schemas";
import { ROLES } from "@/server/utils/constants";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withApi(async (req, ctx: Ctx) => {
  const user = await requireAuth(req);
  const { id } = await ctx.params;
  const hw = await homeworkService.getHomework(id);
  await assertCanAccessStudent(user, hw.studentId);
  // Hide teacher-only notes from non-teachers
  if (user.role !== ROLES.TEACHER) {
    const { teacherNotes, ...rest } = hw;
    void teacherNotes;
    return jsonSuccess(rest);
  }
  return jsonSuccess(hw);
});

export const PUT = withApi(async (req, ctx: Ctx) => {
  const user = await requireAuth(req, [ROLES.TEACHER]);
  const { id } = await ctx.params;
  const body = await parseJsonBody(req, updateHomeworkSchema);
  const hw = await homeworkService.updateHomework(id, body, user.id);
  return jsonSuccess(hw);
});
