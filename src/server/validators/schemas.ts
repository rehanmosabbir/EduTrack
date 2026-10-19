import { z } from "zod";
import {
  HomeworkAssignmentStatus,
  HomeworkCompletionStatus,
  PreparationStatus,
  EnrollmentStatus,
  SubjectStatus,
  AccountStatus,
} from "@prisma/client";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createStudentSchema = z.object({
  fullName: z.string().min(2),
  studentCode: z.string().min(1).optional(),
  className: z.string().min(1),
  schoolName: z.string().optional().nullable(),
  enrollmentDate: z.string().datetime().or(z.string().date()),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(72).optional(),
  subjectIds: z.array(z.string()).optional().default([]),
});

export const updateStudentSchema = createStudentSchema.partial().extend({
  status: z.nativeEnum(AccountStatus).optional(),
  photoUrl: z.string().url().optional().nullable(),
});

export const createGuardianSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  phone: z.string().optional().nullable(),
});

export const updateGuardianSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  status: z.nativeEnum(AccountStatus).optional(),
});

export const linkGuardianSchema = z.object({
  guardianId: z.string().min(1),
  studentId: z.string().min(1),
  relationship: z.string().min(1).default("Parent"),
});

export const createSubjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

export const updateSubjectSchema = createSubjectSchema.partial().extend({
  status: z.nativeEnum(SubjectStatus).optional(),
});

export const enrollSubjectSchema = z.object({
  studentId: z.string().min(1),
  subjectId: z.string().min(1),
  status: z.nativeEnum(EnrollmentStatus).optional(),
});

export const homeworkSchema = z.object({
  studentId: z.string().min(1),
  subjectId: z.string().min(1),
  title: z.string().min(1),
  lessonOrChapter: z.string().min(1),
  instructions: z.string().min(1),
  assignedAt: z.string().datetime().or(z.string().date()),
  dueDate: z.string().datetime().or(z.string().date()).optional().nullable(),
  maximumMarks: z.coerce.number().positive().optional().nullable(),
  attachmentUrl: z.string().url().optional().nullable(),
  teacherNotes: z.string().max(2000).optional().nullable(),
});

export const updateHomeworkSchema = homeworkSchema.partial().extend({
  status: z.nativeEnum(HomeworkAssignmentStatus).optional(),
});

const marksRefine = <T extends { marksObtained?: number | null; maximumMarks?: number | null }>(
  data: T,
) => {
  const hasObtained = data.marksObtained !== undefined && data.marksObtained !== null;
  const hasMax = data.maximumMarks !== undefined && data.maximumMarks !== null;
  if (!hasObtained && !hasMax) return true;
  if (hasObtained !== hasMax) return false;
  if (data.maximumMarks! <= 0) return false;
  if (data.marksObtained! < 0) return false;
  return data.marksObtained! <= data.maximumMarks!;
};

export const evaluationSchema = z
  .object({
    studentId: z.string().min(1),
    subjectId: z.string().min(1),
    homeworkAssignmentId: z.string().optional().nullable(),
    evaluationDate: z.string().datetime().or(z.string().date()),
    lessonOrChapter: z.string().min(1),
    preparationStatus: z.nativeEnum(PreparationStatus),
    homeworkStatus: z.nativeEnum(HomeworkCompletionStatus),
    marksObtained: z.coerce.number().min(0).optional().nullable(),
    maximumMarks: z.coerce.number().positive().optional().nullable(),
    teacherFeedback: z.string().max(4000).optional().nullable(),
    privateTeacherNotes: z.string().max(4000).optional().nullable(),
    clientRequestId: z.string().min(8).max(64).optional(),
  })
  .refine(marksRefine, {
    message:
      "Marks obtained and maximum marks must both be set, with obtained ≤ maximum and maximum > 0",
    path: ["marksObtained"],
  });

export const updateEvaluationSchema = z
  .object({
    subjectId: z.string().min(1).optional(),
    homeworkAssignmentId: z.string().optional().nullable(),
    evaluationDate: z.string().datetime().or(z.string().date()).optional(),
    lessonOrChapter: z.string().min(1).optional(),
    preparationStatus: z.nativeEnum(PreparationStatus).optional(),
    homeworkStatus: z.nativeEnum(HomeworkCompletionStatus).optional(),
    marksObtained: z.coerce.number().min(0).optional().nullable(),
    maximumMarks: z.coerce.number().positive().optional().nullable(),
    teacherFeedback: z.string().max(4000).optional().nullable(),
    privateTeacherNotes: z.string().max(4000).optional().nullable(),
  })
  .refine(marksRefine, {
    message:
      "Marks obtained and maximum marks must both be set, with obtained ≤ maximum and maximum > 0",
    path: ["marksObtained"],
  });

export const commentSchema = z.object({
  studentId: z.string().min(1),
  message: z.string().min(1).max(4000),
  relatedEvaluationId: z.string().optional().nullable(),
  relatedHomeworkAssignmentId: z.string().optional().nullable(),
  parentCommentId: z.string().optional().nullable(),
});

export const historyQuerySchema = z.object({
  studentId: z.string().min(1),
  from: z.string().optional(),
  to: z.string().optional(),
  subjectId: z.string().optional(),
  lesson: z.string().optional(),
  preparationStatus: z.nativeEnum(PreparationStatus).optional(),
  homeworkStatus: z.nativeEnum(HomeworkCompletionStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
