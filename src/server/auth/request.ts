import { AccountStatus } from "@prisma/client";
import { prisma } from "@/server/lib/prisma";
import { verifyAccessToken } from "@/server/auth/jwt";
import type { AuthUser } from "@/server/auth/types";
import { Errors } from "@/server/utils/AppError";
import type { RoleType } from "@/server/utils/constants";

export async function requireAuth(
  req: Request,
  roles?: RoleType[],
): Promise<AuthUser> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw Errors.unauthorized();
  }

  const token = header.slice(7);
  let payload: { sub: string; email: string; role: RoleType };
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw Errors.unauthorized("Invalid or expired token");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: {
      student: { select: { id: true } },
      guardian: { select: { id: true } },
    },
  });

  if (!user || user.status !== AccountStatus.ACTIVE) {
    throw Errors.unauthorized("User not found or inactive");
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    image: user.image,
    studentId: user.student?.id ?? null,
    guardianId: user.guardian?.id ?? null,
  };

  if (roles && !roles.includes(authUser.role)) {
    throw Errors.forbidden();
  }

  return authUser;
}
