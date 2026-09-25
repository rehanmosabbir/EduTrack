import type { Request, Response } from "express";
import { param } from "../utils/params.js";
import path from "path";
import fs from "fs";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as noteService from "../services/note.service.js";
import { resolveLocalPath } from "../services/storage.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { Errors } from "../utils/AppError.js";
import { ROLES, STAFF_ROLES } from "../utils/constants.js";
import { ALLOWED_NOTE_MIME_TYPES } from "../utils/constants.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const isStaff = STAFF_ROLES.includes(req.user!.role);
  const q = req.query as {
    page?: number;
    limit?: number;
    search?: string;
    subjectId?: string;
    fileType?: string;
  };
  const result = await noteService.listNotes({
    page: Number(q.page ?? 1),
    limit: Number(q.limit ?? 20),
    search: q.search,
    subjectId: q.subjectId,
    fileType: q.fileType,
    studentId: req.user!.studentProfileId ?? undefined,
    isStaff,
  });
  return sendSuccess(res, result.items, 200, result.meta);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const isStaff = STAFF_ROLES.includes(req.user!.role);
  const note = await noteService.assertNoteAccess(
    param(req, "id"),
    req.user!.studentProfileId,
    isStaff,
  );
  return sendSuccess(res, note);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) throw Errors.validation("File is required");
  if (
    !ALLOWED_NOTE_MIME_TYPES.includes(
      file.mimetype as (typeof ALLOWED_NOTE_MIME_TYPES)[number],
    )
  ) {
    throw Errors.validation("Unsupported file type");
  }

  const note = await noteService.createNote(req.body, file, req.user!.id);
  return sendSuccess(res, note, 201);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const result = await noteService.deleteNote(param(req, "id"), req.user!.id);
  return sendSuccess(res, result);
});

export const download = asyncHandler(async (req: Request, res: Response) => {
  const isStaff = STAFF_ROLES.includes(req.user!.role);
  const note = await noteService.assertNoteAccess(
    param(req, "id"),
    req.user!.studentProfileId,
    isStaff,
  );

  const localPath = resolveLocalPath(note.fileUrl);
  if (!localPath || !fs.existsSync(localPath)) {
    throw Errors.notFound("File not found on storage");
  }

  res.download(localPath, note.fileName);
  void path;
  void ROLES;
});
