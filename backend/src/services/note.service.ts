import { prisma } from "../lib/prisma.js";
import { Errors } from "../utils/AppError.js";
import { ACTIVITY_ACTIONS, logActivity } from "./activity.service.js";
import { deleteStoredFile, storeFile } from "./storage.service.js";

export async function listNotes(params: {
  page: number;
  limit: number;
  search?: string;
  subjectId?: string;
  fileType?: string;
  studentId?: string;
  isStaff: boolean;
}) {
  const { page, limit, search, subjectId, fileType, studentId, isStaff } =
    params;
  const skip = (page - 1) * limit;

  const visibilityFilter = isStaff
    ? {}
    : studentId
      ? {
          OR: [
            { assignToAll: true },
            { students: { some: { studentId } } },
          ],
        }
      : { assignToAll: true };

  const where = {
    ...visibilityFilter,
    ...(subjectId ? { subjectId } : {}),
    ...(fileType
      ? { fileType: { contains: fileType, mode: "insensitive" as const } }
      : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { fileName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.note.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        subject: true,
        uploader: { select: { id: true, name: true } },
        students: {
          include: {
            student: {
              include: { user: { select: { name: true } } },
            },
          },
        },
      },
    }),
    prisma.note.count({ where }),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getNote(id: string) {
  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      subject: true,
      uploader: { select: { id: true, name: true } },
      students: true,
    },
  });
  if (!note) throw Errors.notFound("Note not found");
  return note;
}

export async function createNote(
  meta: {
    title: string;
    description?: string;
    subjectId?: string | null;
    assignToAll: boolean;
    studentIds: string[];
  },
  file: Express.Multer.File,
  actorId: string,
) {
  const stored = await storeFile(file);

  const note = await prisma.note.create({
    data: {
      title: meta.title,
      description: meta.description,
      subjectId: meta.subjectId || null,
      uploadedBy: actorId,
      assignToAll: meta.assignToAll,
      fileUrl: stored.fileUrl,
      fileName: stored.fileName,
      fileType: stored.fileType,
      fileSize: stored.fileSize,
      ...(meta.assignToAll || meta.studentIds.length === 0
        ? {}
        : {
            students: {
              create: meta.studentIds.map((studentId) => ({ studentId })),
            },
          }),
    },
    include: {
      subject: true,
      uploader: { select: { id: true, name: true } },
      students: true,
    },
  });

  await logActivity({
    userId: actorId,
    action: ACTIVITY_ACTIONS.NOTE_UPLOADED,
    entityType: "Note",
    entityId: note.id,
    metadata: { title: meta.title },
  });

  return note;
}

export async function deleteNote(id: string, actorId: string) {
  const note = await getNote(id);
  await prisma.note.delete({ where: { id } });
  await deleteStoredFile(note.fileUrl);
  await logActivity({
    userId: actorId,
    action: ACTIVITY_ACTIONS.NOTE_DELETED,
    entityType: "Note",
    entityId: id,
  });
  return { id };
}

export async function assertNoteAccess(
  noteId: string,
  studentProfileId: string | null | undefined,
  isStaff: boolean,
) {
  const note = await getNote(noteId);
  if (isStaff) return note;
  if (note.assignToAll) return note;
  if (!studentProfileId) throw Errors.forbidden();
  const assigned = note.students.some((s) => s.studentId === studentProfileId);
  if (!assigned) throw Errors.forbidden("This note is not assigned to you");
  return note;
}
