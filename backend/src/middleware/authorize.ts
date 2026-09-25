import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { Errors } from "../utils/AppError.js";
import { ROLES } from "../utils/constants.js";
import { asyncHandler } from "./errorHandler.js";

/** Ensures a student can only access their own student profile resources. */
export const requireOwnStudent = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw Errors.unauthorized();
    }

    if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.TEACHER) {
      next();
      return;
    }

    const studentId =
      (req.params.studentId as string | undefined) ||
      (req.body?.studentId as string | undefined) ||
      (req.query.studentId as string | undefined);

    if (!studentId) {
      if (!req.user.studentProfileId) {
        throw Errors.forbidden("No student profile linked");
      }
      next();
      return;
    }

    if (req.user.studentProfileId !== studentId) {
      throw Errors.forbidden("You can only access your own data");
    }

    next();
  },
);

export async function assertStudentAccess(
  user: Express.Request["user"],
  studentProfileId: string,
) {
  if (!user) throw Errors.unauthorized();
  if (user.role === ROLES.ADMIN || user.role === ROLES.TEACHER) return;
  if (user.studentProfileId !== studentProfileId) {
    throw Errors.forbidden("You can only access your own data");
  }
}

export async function getStudentProfileIdOrThrow(user: Express.Request["user"]) {
  if (!user) throw Errors.unauthorized();
  if (user.role === ROLES.STUDENT) {
    if (!user.studentProfileId) throw Errors.forbidden("No student profile");
    return user.studentProfileId;
  }
  return null;
}

export async function resolveStudentIdForQuery(
  user: Express.Request["user"],
  requestedStudentId?: string,
) {
  if (!user) throw Errors.unauthorized();

  if (user.role === ROLES.STUDENT) {
    if (!user.studentProfileId) throw Errors.forbidden("No student profile");
    if (requestedStudentId && requestedStudentId !== user.studentProfileId) {
      throw Errors.forbidden("You can only access your own data");
    }
    return user.studentProfileId;
  }

  if (requestedStudentId) {
    const exists = await prisma.studentProfile.findUnique({
      where: { id: requestedStudentId },
      select: { id: true },
    });
    if (!exists) throw Errors.notFound("Student not found");
    return requestedStudentId;
  }

  return undefined;
}
