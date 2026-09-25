import type { Request, Response } from "express";
import { param } from "../utils/params.js";
import * as subjectService from "../services/subject.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 50, search } = req.query as {
    page?: number;
    limit?: number;
    search?: string;
  };
  const result = await subjectService.listSubjects({
    page: Number(page),
    limit: Number(limit),
    search,
  });
  return sendSuccess(res, result.items, 200, result.meta);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const subject = await subjectService.getSubject(param(req, "id"));
  return sendSuccess(res, subject);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const subject = await subjectService.createSubject(req.body);
  return sendSuccess(res, subject, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const subject = await subjectService.updateSubject(param(req, "id"), req.body);
  return sendSuccess(res, subject);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const result = await subjectService.deleteSubject(param(req, "id"));
  return sendSuccess(res, result);
});
