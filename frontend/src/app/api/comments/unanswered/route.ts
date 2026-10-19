import { withApi, jsonSuccess, getSearchParams } from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import * as commentService from "@/server/services/comment.service";
import { ROLES } from "@/server/utils/constants";

export const GET = withApi(async (req) => {
  await requireAuth(req, [ROLES.TEACHER]);
  const q = getSearchParams(req);
  const result = await commentService.listUnansweredComments(
    Number(q.page ?? 1),
    Number(q.limit ?? 20),
  );
  return jsonSuccess(result.items, 200, result.meta);
});
