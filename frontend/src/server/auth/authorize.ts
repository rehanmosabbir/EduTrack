import { prisma } from "@/server/lib/prisma";
import type { AuthUser } from "@/server/auth/types";
import { Errors } from "@/server/utils/AppError";
import { ROLES } from "@/server/utils/constants";

export function assertTeacher(user: AuthUser | undefined) {
  if (!user) throw Errors.unauthorized();
  if (user.role !== ROLES.TEACHER) throw Errors.forbidden();
}

/** Teacher: any student. Student: self. Guardian: linked child only. */
export async function assertCanAccessStudent(
  user: AuthUser | undefined,
  studentId: string,
) {
  if (!user) throw Errors.unauthorized();

  if (user.role === ROLES.TEACHER) {
    const exists = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true },
    });
    if (!exists) throw Errors.notFound("Student not found");
    return;
  }

  if (user.role === ROLES.STUDENT) {
    if (user.studentId !== studentId) {
      throw Errors.forbidden("You can only access your own records");
    }
    return;
  }

  if (user.role === ROLES.GUARDIAN) {
    if (!user.guardianId) throw Errors.forbidden("No guardian profile");
    const link = await prisma.studentGuardian.findUnique({
      where: {
        studentId_guardianId: {
          studentId,
          guardianId: user.guardianId,
        },
      },
    });
    if (!link) {
      throw Errors.forbidden("You can only access linked children");
    }
    return;
  }

  throw Errors.forbidden();
}

export async function getAccessibleStudentIds(user: AuthUser): Promise<string[] | "ALL"> {
  if (user.role === ROLES.TEACHER) return "ALL";
  if (user.role === ROLES.STUDENT) {
    if (!user.studentId) return [];
    return [user.studentId];
  }
  if (user.role === ROLES.GUARDIAN) {
    if (!user.guardianId) return [];
    const links = await prisma.studentGuardian.findMany({
      where: { guardianId: user.guardianId },
      select: { studentId: true },
    });
    return links.map((l) => l.studentId);
  }
  return [];
}
