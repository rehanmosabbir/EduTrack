import jwt from "jsonwebtoken";
import { env } from "@/server/config/env";
import type { RoleType } from "@/server/utils/constants";

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

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
