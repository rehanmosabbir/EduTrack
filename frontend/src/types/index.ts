export type Role = "TEACHER" | "STUDENT" | "GUARDIAN";

export type AccountStatus = "ACTIVE" | "INACTIVE";
export type PreparationStatus =
  | "PREPARED"
  | "PARTIALLY_PREPARED"
  | "NOT_PREPARED";
export type HomeworkCompletionStatus =
  | "COMPLETED"
  | "PARTIALLY_COMPLETED"
  | "NOT_COMPLETED";
export type HomeworkAssignmentStatus = "ACTIVE" | "CANCELLED" | "COMPLETED";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  studentId?: string | null;
  guardianId?: string | null;
}

export interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  photoUrl?: string | null;
  className: string;
  schoolName?: string | null;
  enrollmentDate: string;
  phone?: string | null;
  status: AccountStatus;
  user?: { id: string; email: string; status: AccountStatus } | null;
  subjects?: Array<{ subject: Subject; status: string }>;
  guardians?: Array<{
    relationship: string;
    guardian: {
      id: string;
      user: { id: string; name: string; email: string };
    };
  }>;
}

export interface Subject {
  id: string;
  name: string;
  description?: string | null;
  status: string;
}

export interface HomeworkAssignment {
  id: string;
  studentId: string;
  subjectId: string;
  title: string;
  lessonOrChapter: string;
  instructions: string;
  assignedAt: string;
  dueDate?: string | null;
  maximumMarks?: number | null;
  attachmentUrl?: string | null;
  teacherNotes?: string | null;
  status: HomeworkAssignmentStatus;
  student?: Pick<Student, "id" | "fullName" | "studentCode" | "className">;
  subject?: Subject;
}

export interface LessonEvaluation {
  id: string;
  studentId: string;
  subjectId: string;
  homeworkAssignmentId?: string | null;
  evaluationDate: string;
  lessonOrChapter: string;
  preparationStatus: PreparationStatus;
  homeworkStatus: HomeworkCompletionStatus;
  marksObtained?: number | null;
  maximumMarks?: number | null;
  teacherFeedback?: string | null;
  privateTeacherNotes?: string | null;
  student?: Pick<Student, "id" | "fullName" | "studentCode" | "className">;
  subject?: Subject;
  homeworkAssignment?: { id: string; title: string; lessonOrChapter: string } | null;
}

export interface GuardianComment {
  id: string;
  studentId: string;
  message: string;
  authorRole: Role;
  createdAt: string;
  guardian?: { user: { id: string; name: string } } | null;
  replies?: GuardianComment[];
  student?: Pick<Student, "id" | "fullName" | "studentCode">;
}
