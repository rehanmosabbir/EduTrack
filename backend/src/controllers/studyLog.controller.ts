import type { Request, Response } from "express";
import { param } from "../utils/params.js";
import { resolveStudentIdForQuery } from "../middleware/authorize.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as studyLogService from "../services/studyLog.service.js";
import * as studyStatsService from "../services/studyStats.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { Errors } from "../utils/AppError.js";
import { ROLES } from "../utils/constants.js";
import { assertStudentAccess } from "../middleware/authorize.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as {
    page?: number;
    limit?: number;
    studentId?: string;
    from?: string;
    to?: string;
  };
  const studentId = await resolveStudentIdForQuery(req.user, q.studentId);
  const result = await studyLogService.listStudyLogs({
    studentId,
    from: q.from,
    to: q.to,
    page: Number(q.page ?? 1),
    limit: Number(q.limit ?? 20),
  });
  return sendSuccess(res, result.items, 200, result.meta);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const log = await studyLogService.getStudyLog(param(req, "id"));
  await assertStudentAccess(req.user, log.studentId);
  return sendSuccess(res, log);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  let studentId = req.body.studentId as string | undefined;
  if (req.user!.role === ROLES.STUDENT) {
    studentId = req.user!.studentProfileId!;
  }
  if (!studentId) throw Errors.validation("studentId is required");
  await assertStudentAccess(req.user, studentId);

  // Students can only edit today unless staff
  if (req.user!.role === ROLES.STUDENT) {
    const today = new Date().toISOString().slice(0, 10);
    const dateStr = String(req.body.date).slice(0, 10);
    if (dateStr !== today) {
      throw Errors.forbidden("Students can only add/update today's study log");
    }
  }

  const log = await studyLogService.upsertStudyLog(
    { ...req.body, studentId },
    req.user!.id,
  );
  return sendSuccess(res, log, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const existing = await studyLogService.getStudyLog(param(req, "id"));
  await assertStudentAccess(req.user, existing.studentId);

  if (req.user!.role === ROLES.STUDENT) {
    const today = new Date().toISOString().slice(0, 10);
    const logDate = existing.date.toISOString().slice(0, 10);
    if (logDate !== today) {
      throw Errors.forbidden("Students can only edit today's study log");
    }
  }

  const log = await studyLogService.updateStudyLog(
    param(req, "id"),
    req.body,
    req.user!.id,
  );
  return sendSuccess(res, log);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const existing = await studyLogService.getStudyLog(param(req, "id"));
  await assertStudentAccess(req.user, existing.studentId);
  if (req.user!.role === ROLES.STUDENT) {
    throw Errors.forbidden("Students cannot delete study logs");
  }
  const result = await studyLogService.deleteStudyLog(
    param(req, "id"),
    req.user!.id,
  );
  return sendSuccess(res, result);
});

export const stats = asyncHandler(async (req: Request, res: Response) => {
  const studentId = await resolveStudentIdForQuery(
    req.user,
    req.query.studentId as string | undefined,
  );
  if (!studentId) throw Errors.validation("studentId is required");
  const data = await studyStatsService.getStudyStats(studentId);
  return sendSuccess(res, data);
});

export const trend = asyncHandler(async (req: Request, res: Response) => {
  const studentId = await resolveStudentIdForQuery(
    req.user,
    req.query.studentId as string | undefined,
  );
  const days = Number(req.query.days ?? 30);
  const data = await studyStatsService.getStudyTrend(studentId, days);
  return sendSuccess(res, data);
});

export const calendar = asyncHandler(async (req: Request, res: Response) => {
  const studentId = await resolveStudentIdForQuery(
    req.user,
    req.query.studentId as string | undefined,
  );
  if (!studentId) throw Errors.validation("studentId is required");
  const year = Number(req.query.year ?? new Date().getFullYear());
  const month = Number(req.query.month ?? new Date().getMonth() + 1);
  const data = await studyStatsService.getCalendarStudyData(
    studentId,
    year,
    month,
  );
  return sendSuccess(res, data);
});
