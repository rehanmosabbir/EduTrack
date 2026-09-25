import type { Request, Response } from "express";
import { param } from "../utils/params.js";
import { GoalStatus } from "@prisma/client";
import { assertStudentAccess, resolveStudentIdForQuery } from "../middleware/authorize.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as goalService from "../services/goal.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { Errors } from "../utils/AppError.js";
import { ROLES } from "../utils/constants.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as {
    page?: number;
    limit?: number;
    studentId?: string;
    status?: GoalStatus;
  };
  const studentId = await resolveStudentIdForQuery(req.user, q.studentId);
  const result = await goalService.listGoals({
    studentId,
    status: q.status,
    page: Number(q.page ?? 1),
    limit: Number(q.limit ?? 20),
  });
  return sendSuccess(res, result.items, 200, result.meta);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const goal = await goalService.getGoal(param(req, "id"));
  await assertStudentAccess(req.user, goal.studentId);
  return sendSuccess(res, goal);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  let studentId = req.body.studentId as string | undefined;
  if (req.user!.role === ROLES.STUDENT) {
    studentId = req.user!.studentProfileId!;
  }
  if (!studentId) throw Errors.validation("studentId is required");
  await assertStudentAccess(req.user, studentId);
  const goal = await goalService.createGoal(
    { ...req.body, studentId },
    req.user!.id,
  );
  return sendSuccess(res, goal, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const existing = await goalService.getGoal(param(req, "id"));
  await assertStudentAccess(req.user, existing.studentId);
  const goal = await goalService.updateGoal(
    param(req, "id"),
    req.body,
    req.user!.id,
  );
  return sendSuccess(res, goal);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const existing = await goalService.getGoal(param(req, "id"));
  await assertStudentAccess(req.user, existing.studentId);
  const result = await goalService.deleteGoal(param(req, "id"));
  return sendSuccess(res, result);
});
