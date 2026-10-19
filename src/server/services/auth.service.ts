import bcrypt from "bcryptjs";
import { AccountStatus, Role } from "@prisma/client";
import { prisma } from "@/server/lib/prisma";
import { Errors } from "@/server/utils/AppError";
import { signAccessToken } from "@/server/auth/jwt";
import type { RoleType } from "@/server/utils/constants";

function toAuthPayload(user: {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
  student?: { id: string } | null;
  guardian?: { id: string } | null;
}) {
  const accessToken = signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role as RoleType,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      studentId: user.student?.id ?? null,
      guardianId: user.guardian?.id ?? null,
    },
    accessToken,
  };
}

export async function loginWithPassword(input: {
  email: string;
  password: string;
}) {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      student: { select: { id: true } },
      guardian: { select: { id: true } },
    },
  });

  if (!user || !user.passwordHash || user.status !== AccountStatus.ACTIVE) {
    throw Errors.unauthorized("Invalid email or password");
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw Errors.unauthorized("Invalid email or password");

  return toAuthPayload(user);
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      student: true,
      guardian: {
        include: {
          students: {
            include: {
              student: {
                select: {
                  id: true,
                  fullName: true,
                  studentCode: true,
                  className: true,
                  status: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!user) throw Errors.notFound("User not found");
  const { passwordHash, ...safe } = user;
  void passwordHash;
  return safe;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function updateProfile(
  userId: string,
  input: { name: string },
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: input.name.trim() },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
    },
  });
  return user;
}

export async function changePassword(
  userId: string,
  input: { currentPassword: string; newPassword: string },
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.passwordHash) {
    throw Errors.badRequest("Password change is not available for this account");
  }

  const ok = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!ok) throw Errors.unauthorized("Current password is incorrect");

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(input.newPassword) },
  });

  return { ok: true };
}
