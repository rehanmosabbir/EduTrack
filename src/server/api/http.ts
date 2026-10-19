import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/server/utils/AppError";

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export function jsonSuccess<T>(data: T, status = 200, meta?: ApiMeta) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    { status },
  );
}

export function jsonError(
  message: string,
  statusCode = 500,
  code = "INTERNAL_ERROR",
  details?: unknown,
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status: statusCode },
  );
}

export function handleApiError(err: unknown) {
  if (err instanceof AppError) {
    return jsonError(err.message, err.statusCode, err.code, err.details);
  }
  if (err instanceof ZodError) {
    return jsonError("Validation failed", 400, "VALIDATION_ERROR", err.flatten());
  }
  console.error(err);
  return jsonError("Internal server error", 500, "INTERNAL_ERROR");
}

export function withApi<C>(
  handler: (req: Request, context: C) => Promise<Response> | Response,
): (req: Request) => Promise<Response> {
  return async (req: Request, context?: C) => {
    try {
      return await handler(req, context as C);
    } catch (err) {
      return handleApiError(err);
    }
  };
}

export async function parseJsonBody<T>(
  req: Request,
  schema: { parse: (data: unknown) => T },
): Promise<T> {
  const body = await req.json();
  return schema.parse(body);
}

export function getSearchParams(req: Request) {
  return Object.fromEntries(new URL(req.url).searchParams.entries());
}
