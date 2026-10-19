import { AccountStatus, Role } from "@prisma/client";
import { prisma } from "@/server/lib/prisma";
import { Errors } from "@/server/utils/AppError";
import { hashPassword } from "@/server/services/auth.service";
import { writeAuditLog } from "@/server/services/audit.service";

function genStudentCode() {
  return `STU-${Date.now().toString().slice(-8)}`;
}

export async function listStudents(params: {
  page: number;
  limit: number;
  search?: string;
  className?: string;
  status?: AccountStatus;
}) {
  const { page, limit, search, className, status } = params;
  const where = {
    ...(status ? { status } : {}),
    ...(className ? { className } : {}),
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" as const } },
            { studentCode: { contains: search, mode: "insensitive" as const } },
            { schoolName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, status: true } },
        subjects: { include: { subject: true } },
        guardians: {
          include: {
            guardian: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
          },
        },
      },
      orderBy: { fullName: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.student.count({ where }),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getStudent(id: string) {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, status: true, name: true } },
      subjects: { include: { subject: true } },
      guardians: {
        include: {
          guardian: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      },
    },
  });
  if (!student) throw Errors.notFound("Student not found");
  return student;
}

export async function createStudent(
  input: {
    fullName: string;
    studentCode?: string;
    className: string;
    schoolName?: string | null;
    enrollmentDate: string;
    phone?: string | null;
    email?: string;
    password?: string;
    subjectIds?: string[];
  },
  actorId: string,
) {
  const studentCode = input.studentCode?.trim() || genStudentCode();
  const existing = await prisma.student.findUnique({ where: { studentCode } });
  if (existing) throw Errors.conflict("Student code already exists");

  return prisma.$transaction(async (tx) => {
    let userId: string | undefined;
    if (input.email && input.password) {
      const email = input.email.toLowerCase();
      const taken = await tx.user.findUnique({ where: { email } });
      if (taken) throw Errors.conflict("Email already in use");
      const user = await tx.user.create({
        data: {
          name: input.fullName,
          email,
          passwordHash: await hashPassword(input.password),
          role: Role.STUDENT,
        },
      });
      userId = user.id;
    }

    const student = await tx.student.create({
      data: {
        userId,
        studentCode,
        fullName: input.fullName.trim(),
        className: input.className,
        schoolName: input.schoolName ?? null,
        enrollmentDate: new Date(input.enrollmentDate),
        phone: input.phone ?? null,
        subjects: input.subjectIds?.length
          ? {
              create: input.subjectIds.map((subjectId) => ({ subjectId })),
            }
          : undefined,
      },
      include: {
        user: { select: { id: true, email: true } },
        subjects: { include: { subject: true } },
      },
    });

    await writeAuditLog({
      actorUserId: actorId,
      entityType: "Student",
      entityId: student.id,
      action: "CREATED",
      newValues: { studentCode, fullName: student.fullName },
    });

    return student;
  });
}

export async function updateStudent(
  id: string,
  input: Record<string, unknown>,
  actorId: string,
) {
  const prev = await getStudent(id);
  const data: Record<string, unknown> = {};
  for (const key of [
    "fullName",
    "className",
    "schoolName",
    "phone",
    "status",
    "photoUrl",
  ] as const) {
    if (input[key] !== undefined) data[key] = input[key];
  }
  if (input.enrollmentDate) {
    data.enrollmentDate = new Date(String(input.enrollmentDate));
  }

  const student = await prisma.student.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, email: true } },
      subjects: { include: { subject: true } },
      guardians: {
        include: {
          guardian: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      },
    },
  });

  await writeAuditLog({
    actorUserId: actorId,
    entityType: "Student",
    entityId: id,
    action: "UPDATED",
    previousValues: {
      fullName: prev.fullName,
      status: prev.status,
      className: prev.className,
    },
    newValues: data,
  });

  return student;
}

export async function setStudentSubjects(
  studentId: string,
  subjectIds: string[],
  actorId: string,
) {
  await getStudent(studentId);
  await prisma.$transaction(async (tx) => {
    await tx.studentSubject.deleteMany({ where: { studentId } });
    if (subjectIds.length) {
      await tx.studentSubject.createMany({
        data: subjectIds.map((subjectId) => ({ studentId, subjectId })),
      });
    }
  });
  await writeAuditLog({
    actorUserId: actorId,
    entityType: "StudentSubject",
    entityId: studentId,
    action: "ENROLLMENTS_SET",
    newValues: { subjectIds },
  });
  return getStudent(studentId);
}
