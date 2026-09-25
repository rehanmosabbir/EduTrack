import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { resolveStudentIdForQuery } from "../middleware/authorize.js";
import * as dashboardService from "../services/dashboard.service.js";
import * as activityService from "../services/activity.service.js";
import * as reportService from "../services/report.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { Errors } from "../utils/AppError.js";

export const adminDashboard = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await dashboardService.getAdminDashboard();
    return sendSuccess(res, data);
  },
);

export const studentDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    const studentId = await resolveStudentIdForQuery(
      req.user,
      req.query.studentId as string | undefined,
    );
    if (!studentId) throw Errors.validation("studentId is required");
    const data = await dashboardService.getStudentDashboard(studentId);
    return sendSuccess(res, data);
  },
);

export const activities = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const result = await activityService.listActivities({ page, limit });
  return sendSuccess(res, result.items, 200, result.meta);
});

export const reports = asyncHandler(async (req: Request, res: Response) => {
  const data = await reportService.getReportData({
    studentId: req.query.studentId as string | undefined,
    subjectId: req.query.subjectId as string | undefined,
    from: req.query.from as string | undefined,
    to: req.query.to as string | undefined,
    examName: req.query.examName as string | undefined,
  });
  return sendSuccess(res, data);
});

export const reportsCsv = asyncHandler(async (req: Request, res: Response) => {
  const data = await reportService.getReportData({
    studentId: req.query.studentId as string | undefined,
    subjectId: req.query.subjectId as string | undefined,
    from: req.query.from as string | undefined,
    to: req.query.to as string | undefined,
    examName: req.query.examName as string | undefined,
  });
  const csv = reportService.scoresToCsv(data.scores);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="edutrack-report.csv"',
  );
  res.send(csv);
});
