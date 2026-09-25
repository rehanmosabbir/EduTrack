import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { Errors } from "../utils/AppError.js";
import { ACTIVITY_ACTIONS, logActivity } from "./activity.service.js";

function parseDate(value?: string | null) {
  if (!value) return undefined;
  return new Date(value);
}

export async function listStudents(params: {
  page: number;
  limit: number;
  search?: string;
  className?: string;
  isActive?: boolean;
}) {
  const { page, limit, search, className, isActive } = params;
  const skip = (page - 1) * limit;

  const where = {
    ...(typeof isActive === "boolean" ? { isActive } : {}),
    ...(className ? { className } : {}),
    ...(search
      ? {
          OR: [
            { studentId: { contains: search, mode: "insensitive" as const } },
            { className: { contains: search, mode: "insensitive" as const } },
            { institution: { contains: search, mode: "insensitive" as const } },
            { user: { name: { contains: search, mode: "insensitive" as const } } },
            { user: { email: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.studentProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
        scores: { select: { percentage: true } },
      },
    }),
    prisma.studentProfile.count({ where }),
  ]);

  const mapped = items.map((s) => {
    const avgScore =
      s.scores.length > 0
        ? Math.round(
            (s.scores.reduce((a, b) => a + b.percentage, 0) / s.scores.length) *
              100,
          ) / 100
        : null;
    const { scores: _scores, ...rest } = s;
    return { ...rest, avgScore };
  });

  return {
    items: mapped,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getStudentById(id: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true, role: true },
      },
      scores: {
        include: { subject: true },
        orderBy: { examDate: "desc" },
        take: 50,
      },
      studyLogs: { orderBy: { date: "desc" }, take: 30 },
      goals: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!student) throw Errors.notFound("Student not found");
  return student;
}

export async function createStudent(
  input: {
    name: string;
    email: string;
    studentId: string;
    phone?: string;
    className?: string;
    institution?: string;
    dateOfBirth?: string | null;
    guardianName?: string;
    guardianPhone?: string;
    password?: string;
  },
  actorId: string,
) {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw Errors.conflict("A user with this email already exists");

  const existingSid = await prisma.studentProfile.findUnique({
    where: { studentId: input.studentId },
  });
  if (existingSid) throw Errors.conflict("Student ID already exists");

  const hashed = input.password
    ? await bcrypt.hash(input.password, 12)
    : undefined;

  const student = await prisma.user.create({
    data: {
      name: input.name,
      email,
      role: Role.STUDENT,
      password: hashed,
      studentProfile: {
        create: {
          studentId: input.studentId,
          phone: input.phone,
          className: input.className,
          institution: input.institution,
          dateOfBirth: parseDate(input.dateOfBirth),
          guardianName: input.guardianName,
          guardianPhone: input.guardianPhone,
        },
      },
    },
    include: {
      studentProfile: true,
    },
  });

  await logActivity({
    userId: actorId,
    action: ACTIVITY_ACTIONS.STUDENT_CREATED,
    entityType: "StudentProfile",
    entityId: student.studentProfile?.id,
    metadata: { name: input.name, email },
  });

  return student;
}

export async function updateStudent(
  id: string,
  input: {
    name?: string;
    email?: string;
    studentId?: string;
    phone?: string;
    className?: string;
    institution?: string;
    dateOfBirth?: string | null;
    guardianName?: string;
    guardianPhone?: string;
    isActive?: boolean;
  },
  actorId: string,
) {
  const existing = await prisma.studentProfile.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!existing) throw Errors.notFound("Student not found");

  if (input.email && input.email.toLowerCase() !== existing.user.email) {
    const taken = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (taken) throw Errors.conflict("Email already in use");
  }

  if (input.studentId && input.studentId !== existing.studentId) {
    const taken = await prisma.studentProfile.findUnique({
      where: { studentId: input.studentId },
    });
    if (taken) throw Errors.conflict("Student ID already exists");
  }

  const [student] = await prisma.$transaction([
    prisma.studentProfile.update({
      where: { id },
      data: {
        studentId: input.studentId,
        phone: input.phone,
        className: input.className,
        institution: input.institution,
        dateOfBirth:
          input.dateOfBirth === undefined
            ? undefined
            : parseDate(input.dateOfBirth),
        guardianName: input.guardianName,
        guardianPhone: input.guardianPhone,
        isActive: input.isActive,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
      },
    }),
    prisma.user.update({
      where: { id: existing.userId },
      data: {
        name: input.name,
        email: input.email?.toLowerCase(),
      },
    }),
  ]);

  await logActivity({
    userId: actorId,
    action: ACTIVITY_ACTIONS.STUDENT_UPDATED,
    entityType: "StudentProfile",
    entityId: id,
  });

  return student;
}

export async function deleteStudent(id: string) {
  const existing = await prisma.studentProfile.findUnique({ where: { id } });
  if (!existing) throw Errors.notFound("Student not found");
  await prisma.user.delete({ where: { id: existing.userId } });
  return { id };
}
