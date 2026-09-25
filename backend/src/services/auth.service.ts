import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { Errors } from "../utils/AppError.js";
import { signAccessToken } from "../middleware/auth.js";
import type { RoleType } from "../utils/constants.js";

function toAuthPayload(user: {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
  studentProfile?: { id: string } | null;
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
      studentProfileId: user.studentProfile?.id ?? null,
    },
    accessToken,
  };
}

export async function syncGoogleUser(input: {
  email: string;
  name: string;
  image?: string | null;
  googleId: string;
}) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email.toLowerCase() }, { googleId: input.googleId }],
    },
    include: { studentProfile: { select: { id: true } } },
  });

  if (!user) {
    throw Errors.forbidden(
      "Account not registered. Please contact your teacher/admin to create an account first.",
    );
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      googleId: input.googleId,
      image: input.image ?? user.image,
      name: input.name || user.name,
      email: input.email.toLowerCase(),
    },
    include: { studentProfile: { select: { id: true } } },
  });

  return toAuthPayload(updated);
}

export async function registerWithPassword(input: {
  name: string;
  email: string;
  password: string;
  studentId?: string;
  className?: string;
  institution?: string;
  phone?: string;
}) {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw Errors.conflict("An account with this email already exists");
  }

  const studentId =
    input.studentId?.trim() ||
    `STU-${Date.now().toString().slice(-8)}`;

  const sidTaken = await prisma.studentProfile.findUnique({
    where: { studentId },
  });
  if (sidTaken) {
    throw Errors.conflict("Student ID already exists");
  }

  const hashed = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      password: hashed,
      role: Role.STUDENT,
      studentProfile: {
        create: {
          studentId,
          className: input.className,
          institution: input.institution,
          phone: input.phone,
          isActive: true,
        },
      },
    },
    include: { studentProfile: { select: { id: true } } },
  });

  return toAuthPayload(user);
}

export async function loginWithPassword(input: {
  email: string;
  password: string;
}) {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    include: { studentProfile: { select: { id: true } } },
  });

  if (!user || !user.password) {
    throw Errors.unauthorized("Invalid email or password");
  }

  const ok = await bcrypt.compare(input.password, user.password);
  if (!ok) {
    throw Errors.unauthorized("Invalid email or password");
  }

  return toAuthPayload(user);
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
    },
  });

  if (!user) throw Errors.notFound("User not found");

  const { password: _password, ...safe } = user;
  return safe;
}
