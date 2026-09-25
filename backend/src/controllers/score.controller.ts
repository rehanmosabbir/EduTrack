import type { Request, Response } from "express";
import { param } from "../utils/params.js";
import { assertStudentAccess, resolveStudentIdForQuery } from "../middleware/authorize.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as scoreService from "../services/score.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { Errors } from "../utils/AppError.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as {
    page?: number;
    limit?: number;
    studentId?: string;
    subjectId?: string;
    from?: string;
    to?: string;
    examName?: string;
  };
  const studentId = await resolveStudentIdForQuery(req.user, q.studentId);
  const result = await scoreService.listScores({
    studentId,
    subjectId: q.subjectId,
    from: q.from,
    to: q.to,
    examName: q.examName,
    page: Number(q.page ?? 1),
    limit: Number(q.limit ?? 20),
  });
  return sendSuccess(res, result.items, 200, result.meta);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const score = await scoreService.getScore(param(req, "id"));
  await assertStudentAccess(req.user, score.studentId);
  return sendSuccess(res, score);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const score = await scoreService.createScore(req.body, req.user!.id);
  return sendSuccess(res, score, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const score = await scoreService.updateScore(
    param(req, "id"),
    req.body,
    req.user!.id,
  );
  return sendSuccess(res, score);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const result = await scoreService.deleteScore(param(req, "id"), req.user!.id);
  return sendSuccess(res, result);
});

export const stats = asyncHandler(async (req: Request, res: Response) => {
  const studentId = await resolveStudentIdForQuery(
    req.user,
    req.query.studentId as string | undefined,
  );
  if (!studentId) throw Errors.validation("studentId is required");
  const data = await scoreService.getScoreStats(
    studentId,
    req.query.subjectId as string | undefined,
  );
  return sendSuccess(res, data);
});
