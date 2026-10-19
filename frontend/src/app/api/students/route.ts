import {
  withApi,
  jsonSuccess,
  parseJsonBody,
  getSearchParams,
} from "@/server/api/http";
import { requireAuth } from "@/server/auth/request";
import * as studentService from "@/server/services/student.service";
import { createStudentSchema } from "@/server/validators/schemas";
import { ROLES } from "@/server/utils/constants";
import type { AccountStatus } from "@prisma/client";

export const GET = withApi(async (req) => {
  await requireAuth(req, [ROLES.TEACHER]);
  const q = getSearchParams(req);
  const result = await studentService.listStudents({
    page: Number(q.page ?? 1),
    limit: Number(q.limit ?? 20),
    search: q.search,
    className: q.className,
    status: q.status as AccountStatus | undefined,
  });
  return jsonSuccess(result.items, 200, result.meta);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, [ROLES.TEACHER]);
  const body = await parseJsonBody(req, createStudentSchema);
  const student = await studentService.createStudent(body, user.id);
  return jsonSuccess(student, 201);
});
