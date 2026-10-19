import type { LessonEvaluation } from "@prisma/client";
import type { RoleType } from "@/server/utils/constants";
import { ROLES } from "@/server/utils/constants";

/** Strip private teacher notes for student/guardian responses. */
export function serializeEvaluation<T extends LessonEvaluation>(
  evaluation: T,
  viewerRole: RoleType,
) {
  if (viewerRole === ROLES.TEACHER) return evaluation;
  const { privateTeacherNotes, ...rest } = evaluation;
  void privateTeacherNotes;
  return rest;
}

export function serializeEvaluations<T extends LessonEvaluation>(
  items: T[],
  viewerRole: RoleType,
) {
  return items.map((e) => serializeEvaluation(e, viewerRole));
}
