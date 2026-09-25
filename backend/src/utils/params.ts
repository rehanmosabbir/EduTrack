import type { Request } from "express";
import { Errors } from "./AppError.js";

export function param(req: Request, name: string): string {
  const value = req.params[name];
  const id = Array.isArray(value) ? value[0] : value;
  if (!id) throw Errors.badRequest(`Missing path parameter: ${name}`);
  return id;
}
