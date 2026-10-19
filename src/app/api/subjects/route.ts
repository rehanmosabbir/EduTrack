import {
  withApi,
  jsonSuccess,
  parseJsonBody,
  getSearchParams,
} from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import * as subjectService from "@/server/services/subject.service";
import { createSubjectSchema } from "@/server/validators/schemas";
import { ROLES } from "@/server/utils/constants";
import type { SubjectStatus } from "@prisma/client";

export const GET = withApi(async (req) => {
  await requireAuth(req);
  const q = getSearchParams(req);
  const items = await subjectService.listSubjects({
    status: q.status as SubjectStatus | undefined,
    search: q.search,
  });
  return jsonSuccess(items);
});

export const POST = withApi(async (req) => {
  await requireAuth(req, [ROLES.TEACHER]);
  const body = await parseJsonBody(req, createSubjectSchema);
  const subject = await subjectService.createSubject(body);
  return jsonSuccess(subject, 201);
});
