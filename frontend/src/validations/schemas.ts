import { z } from "zod";

export const studyLogSchema = z.object({
  date: z.string().min(1, "Date is required"),
  studyHours: z.coerce.number().int().min(0).max(24),
  studyMinutes: z.coerce.number().int().min(0).max(59),
  description: z.string().max(2000).optional(),
  studentId: z.string().optional(),
});

export const scoreFormSchema = z
  .object({
    studentId: z.string().min(1, "Student is required"),
    subjectId: z.string().min(1, "Subject is required"),
    examName: z.string().min(1, "Exam name is required"),
    examDate: z.string().min(1, "Exam date is required"),
    obtainedMarks: z.coerce.number().min(0),
    totalMarks: z.coerce.number().positive("Total marks must be positive"),
    remarks: z.string().optional(),
  })
  .refine((d) => d.obtainedMarks <= d.totalMarks, {
    message: "Obtained marks cannot exceed total marks",
    path: ["obtainedMarks"],
  });

export const studentFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  studentId: z.string().min(1, "Student ID is required"),
  phone: z.string().optional(),
  className: z.string().optional(),
  institution: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
});

export const subjectFormSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).max(20),
  description: z.string().optional(),
});

export const goalFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  targetValue: z.coerce.number().positive(),
  currentValue: z.coerce.number().min(0).optional(),
  deadline: z.string().optional(),
  studentId: z.string().optional(),
});

export const noteFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  subjectId: z.string().optional(),
  assignToAll: z.boolean().default(true),
});
