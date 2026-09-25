import { z } from "zod";
import { GoalStatus, Role } from "@prisma/client";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const googleSyncSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  image: z.string().url().optional().nullable(),
  googleId: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72),
  studentId: z.string().min(1).optional(),
  className: z.string().optional(),
  institution: z.string().optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const createStudentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  studentId: z.string().min(1),
  phone: z.string().optional(),
  className: z.string().optional(),
  institution: z.string().optional(),
  dateOfBirth: z.string().datetime().or(z.string().date()).optional().nullable(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  password: z.string().min(8).max(72).optional(),
});

export const updateStudentSchema = createStudentSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createSubjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).max(20),
  description: z.string().optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const studyLogSchema = z.object({
  studentId: z.string().optional(),
  date: z.string().datetime().or(z.string().date()),
  studyHours: z.coerce.number().int().min(0).max(24),
  studyMinutes: z.coerce.number().int().min(0).max(59),
  description: z.string().max(2000).optional(),
});

export const scoreBaseSchema = z.object({
  studentId: z.string().min(1),
  subjectId: z.string().min(1),
  examName: z.string().min(1),
  examDate: z.string().datetime().or(z.string().date()),
  obtainedMarks: z.coerce.number().min(0),
  totalMarks: z.coerce.number().positive(),
  remarks: z.string().max(1000).optional(),
});

export const scoreSchema = scoreBaseSchema.refine(
  (d) => d.obtainedMarks <= d.totalMarks,
  {
    message: "Obtained marks cannot exceed total marks",
    path: ["obtainedMarks"],
  },
);

export const updateScoreSchema = scoreBaseSchema.partial().refine(
  (d) =>
    d.obtainedMarks === undefined ||
    d.totalMarks === undefined ||
    d.obtainedMarks <= d.totalMarks,
  {
    message: "Obtained marks cannot exceed total marks",
    path: ["obtainedMarks"],
  },
);

export const goalSchema = z.object({
  studentId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  targetValue: z.coerce.number().positive(),
  currentValue: z.coerce.number().min(0).optional(),
  deadline: z.string().datetime().or(z.string().date()).optional().nullable(),
  status: z.nativeEnum(GoalStatus).optional(),
});

export const updateGoalSchema = goalSchema.partial();

export const noteMetaSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  subjectId: z.string().optional().nullable(),
  assignToAll: z
    .union([z.boolean(), z.literal("true"), z.literal("false")])
    .transform((v) => v === true || v === "true")
    .optional()
    .default(false),
  studentIds: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .transform((v) => {
      if (!v) return [] as string[];
      if (Array.isArray(v)) return v;
      try {
        const parsed = JSON.parse(v) as unknown;
        return Array.isArray(parsed) ? (parsed as string[]) : [v];
      } catch {
        return v.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }),
});

export const dateRangeSchema = z.object({
  from: z.string().datetime().or(z.string().date()).optional(),
  to: z.string().datetime().or(z.string().date()).optional(),
  subjectId: z.string().optional(),
  studentId: z.string().optional(),
  examName: z.string().optional(),
});
