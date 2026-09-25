import type { Request, Response } from "express";
import { param } from "../utils/params.js";
import * as studentService from "../services/student.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { assertStudentAccess } from "../middleware/authorize.js";
import { ROLES } from "../utils/constants.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, search, className, isActive } = req.query as {
    page?: number;
    limit?: number;
    search?: string;
    className?: string;
    isActive?: string;
  };
  const result = await studentService.listStudents({
    page: Number(page),
    limit: Number(limit),
    search,
    className,
    isActive:
      isActive === undefined ? undefined : isActive === "true" || isActive === "1",
  });
  return sendSuccess(res, result.items, 200, result.meta);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  await assertStudentAccess(req.user, param(req, "id"));
  const student = await studentService.getStudentById(param(req, "id"));
  return sendSuccess(res, student);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.createStudent(req.body, req.user!.id);
  return sendSuccess(res, student, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.updateStudent(
    param(req, "id"),
    req.body,
    req.user!.id,
  );
  return sendSuccess(res, student);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const result = await studentService.deleteStudent(param(req, "id"));
  return sendSuccess(res, result);
});

export const meProfile = asyncHandler(async (req: Request, res: Response) => {
  if (req.user!.role !== ROLES.STUDENT || !req.user!.studentProfileId) {
    return sendSuccess(res, null);
  }
  const student = await studentService.getStudentById(
    req.user!.studentProfileId,
  );
  return sendSuccess(res, student);
});
