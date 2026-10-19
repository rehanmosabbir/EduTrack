import { AccountStatus, Role } from "@prisma/client";
import { prisma } from "@/server/lib/prisma";
import { Errors } from "@/server/utils/AppError";
import { hashPassword } from "@/server/services/auth.service";
import { writeAuditLog } from "@/server/services/audit.service";

export async function listGuardians(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const { page, limit, search } = params;
  const where = search
    ? {
        OR: [
          { user: { name: { contains: search, mode: "insensitive" as const } } },
          { user: { email: { contains: search, mode: "insensitive" as const } } },
          { phone: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.guardian.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, status: true } },
        students: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                studentCode: true,
                className: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.guardian.count({ where }),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getGuardian(id: string) {
  const g = await prisma.guardian.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, status: true } },
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
  });
  if (!g) throw Errors.notFound("Guardian not found");
  return g;
}

export async function createGuardian(
  input: {
    name: string;
    email: string;
    password: string;
    phone?: string | null;
  },
  actorId: string,
) {
  const email = input.email.toLowerCase();
  const taken = await prisma.user.findUnique({ where: { email } });
  if (taken) throw Errors.conflict("Email already in use");

  const guardian = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name.trim(),
        email,
        passwordHash: await hashPassword(input.password),
        role: Role.GUARDIAN,
        status: AccountStatus.ACTIVE,
      },
    });
    return tx.guardian.create({
      data: { userId: user.id, phone: input.phone ?? null },
      include: {
        user: { select: { id: true, name: true, email: true, status: true } },
      },
    });
  });

  await writeAuditLog({
    actorUserId: actorId,
    entityType: "Guardian",
    entityId: guardian.id,
    action: "CREATED",
    newValues: { email, name: input.name },
  });

  return guardian;
}

export async function linkGuardian(
  input: { studentId: string; guardianId: string; relationship: string },
  actorId: string,
) {
  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
  });
  if (!student) throw Errors.notFound("Student not found");
  const guardian = await prisma.guardian.findUnique({
    where: { id: input.guardianId },
  });
  if (!guardian) throw Errors.notFound("Guardian not found");

  try {
    const link = await prisma.studentGuardian.create({
      data: {
        studentId: input.studentId,
        guardianId: input.guardianId,
        relationship: input.relationship,
      },
      include: {
        student: { select: { id: true, fullName: true } },
        guardian: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    await writeAuditLog({
      actorUserId: actorId,
      entityType: "StudentGuardian",
      entityId: link.id,
      action: "LINKED",
      newValues: input,
    });
    return link;
  } catch {
    throw Errors.conflict("Guardian already linked to this student");
  }
}

export async function unlinkGuardian(
  studentId: string,
  guardianId: string,
  actorId: string,
) {
  const link = await prisma.studentGuardian.findUnique({
    where: { studentId_guardianId: { studentId, guardianId } },
  });
  if (!link) throw Errors.notFound("Link not found");
  await prisma.studentGuardian.delete({ where: { id: link.id } });
  await writeAuditLog({
    actorUserId: actorId,
    entityType: "StudentGuardian",
    entityId: link.id,
    action: "UNLINKED",
    previousValues: { studentId, guardianId },
  });
  return { id: link.id };
}

export async function getLinkedChildren(guardianId: string) {
  return prisma.studentGuardian.findMany({
    where: { guardianId },
    include: {
      student: {
        include: {
          subjects: { include: { subject: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}
