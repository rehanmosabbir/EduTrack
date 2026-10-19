import { SubjectStatus } from "@prisma/client";
import { prisma } from "@/server/lib/prisma";
import { Errors } from "@/server/utils/AppError";

export async function listSubjects(params?: {
  status?: SubjectStatus;
  search?: string;
}) {
  const where = {
    ...(params?.status ? { status: params.status } : {}),
    ...(params?.search
      ? { name: { contains: params.search, mode: "insensitive" as const } }
      : {}),
  };
  return prisma.subject.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export async function getSubject(id: string) {
  const s = await prisma.subject.findUnique({ where: { id } });
  if (!s) throw Errors.notFound("Subject not found");
  return s;
}

export async function createSubject(input: {
  name: string;
  description?: string | null;
}) {
  try {
    return await prisma.subject.create({
      data: {
        name: input.name.trim(),
        description: input.description ?? null,
      },
    });
  } catch {
    throw Errors.conflict("Subject name already exists");
  }
}

export async function updateSubject(
  id: string,
  input: { name?: string; description?: string | null; status?: SubjectStatus },
) {
  await getSubject(id);
  try {
    return await prisma.subject.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });
  } catch {
    throw Errors.conflict("Subject name already exists");
  }
}
