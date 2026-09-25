import type { Response } from "express";

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: ApiMeta,
) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  code = "INTERNAL_ERROR",
  details?: unknown,
) {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      ...(details !== undefined ? { details } : {}),
    },
  });
}
