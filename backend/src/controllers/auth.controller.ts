import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const googleSync = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.syncGoogleUser(req.body);
  return sendSuccess(res, result);
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerWithPassword(req.body);
  return sendSuccess(res, result, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginWithPassword(req.body);
  return sendSuccess(res, result);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.id);
  return sendSuccess(res, user);
});
