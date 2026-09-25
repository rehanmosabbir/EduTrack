import { prisma } from "../lib/prisma.js";
import { Errors } from "../utils/AppError.js";

export async function listSubjects(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const { page, limit, search } = params;
  const skip = (page - 1) * limit;
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { code: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.subject.count({ where }),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getSubject(id: string) {
  const subject = await prisma.subject.findUnique({ where: { id } });
  if (!subject) throw Errors.notFound("Subject not found");
  return subject;
}

export async function createSubject(input: {
  name: string;
  code: string;
  description?: string;
}) {
  const existing = await prisma.subject.findUnique({
    where: { code: input.code.toUpperCase() },
  });
  if (existing) throw Errors.conflict("Subject code already exists");

  return prisma.subject.create({
    data: {
      name: input.name,
      code: input.code.toUpperCase(),
      description: input.description,
    },
  });
}

export async function updateSubject(
  id: string,
  input: { name?: string; code?: string; description?: string },
) {
  await getSubject(id);
  if (input.code) {
    const existing = await prisma.subject.findFirst({
      where: { code: input.code.toUpperCase(), NOT: { id } },
    });
    if (existing) throw Errors.conflict("Subject code already exists");
  }
  return prisma.subject.update({
    where: { id },
    data: {
      name: input.name,
      code: input.code?.toUpperCase(),
      description: input.description,
    },
  });
}

export async function deleteSubject(id: string) {
  await getSubject(id);
  const scores = await prisma.score.count({ where: { subjectId: id } });
  if (scores > 0) {
    throw Errors.conflict("Cannot delete subject with existing scores");
  }
  await prisma.subject.delete({ where: { id } });
  return { id };
}
