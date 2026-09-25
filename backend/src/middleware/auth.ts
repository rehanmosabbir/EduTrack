import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { Errors } from "../utils/AppError.js";
import type { RoleType } from "../utils/constants.js";
import { asyncHandler } from "./errorHandler.js";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: RoleType;
  image?: string | null;
  studentProfileId?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

interface JwtPayload {
  sub: string;
  email: string;
  role: RoleType;
}

export function signAccessToken(user: {
  id: string;
  email: string;
  role: RoleType;
}): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw Errors.unauthorized();
    }

    const token = header.slice(7);
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      throw Errors.unauthorized("Invalid or expired token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { studentProfile: { select: { id: true } } },
    });

    if (!user) {
      throw Errors.unauthorized("User not found");
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
      studentProfileId: user.studentProfile?.id ?? null,
    };

    next();
  },
);

export function authorize(...roles: RoleType[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(Errors.unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(Errors.forbidden());
      return;
    }
    next();
  };
}
