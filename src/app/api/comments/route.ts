import {
  withApi,
  jsonSuccess,
  parseJsonBody,
  getSearchParams,
} from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import { assertCanAccessStudent } from "@/server/auth/authorize";
import * as commentService from "@/server/services/comment.service";
import { commentSchema } from "@/server/validators/schemas";
import { Errors } from "@/server/utils/AppError";
import { ROLES } from "@/server/utils/constants";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req);
  if (user.role === ROLES.STUDENT) {
    throw Errors.forbidden("Students cannot access guardian conversations");
  }
  const q = getSearchParams(req);
  if (!q.studentId) throw Errors.validation("studentId is required");
  await assertCanAccessStudent(user, q.studentId);
  const result = await commentService.listComments({
    studentId: q.studentId,
    page: Number(q.page ?? 1),
    limit: Number(q.limit ?? 20),
  });
  return jsonSuccess(result.items, 200, result.meta);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, [ROLES.TEACHER, ROLES.GUARDIAN]);
  const body = await parseJsonBody(req, commentSchema);
  await assertCanAccessStudent(user, body.studentId);
  const comment = await commentService.createComment(user, body);
  return jsonSuccess(comment, 201);
});
