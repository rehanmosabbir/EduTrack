export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_ERROR",
    details?: unknown,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const Errors = {
  unauthorized: (message = "Authentication required") =>
    new AppError(message, 401, "UNAUTHORIZED"),
  forbidden: (message = "Permission denied") =>
    new AppError(message, 403, "FORBIDDEN"),
  notFound: (message = "Resource not found") =>
    new AppError(message, 404, "NOT_FOUND"),
  conflict: (message = "Conflict") => new AppError(message, 409, "CONFLICT"),
  validation: (message = "Validation error", details?: unknown) =>
    new AppError(message, 400, "VALIDATION_ERROR", details),
  badRequest: (message = "Bad request", details?: unknown) =>
    new AppError(message, 400, "BAD_REQUEST", details),
};
