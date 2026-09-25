export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  studentProfileId?: string | null;
}

export interface StudentProfile {
  id: string;
  userId: string;
  studentId: string;
  phone?: string | null;
  className?: string | null;
  institution?: string | null;
  dateOfBirth?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  isActive: boolean;
  avgScore?: number | null;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: Role;
  };
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string | null;
}

export interface StudyLog {
  id: string;
  studentId: string;
  date: string;
  studyHours: number;
  studyMinutes: number;
  description?: string | null;
  student?: StudentProfile;
}

export interface Score {
  id: string;
  studentId: string;
  subjectId: string;
  examName: string;
  examDate: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  remarks?: string | null;
  subject?: Subject;
  student?: StudentProfile;
}

export interface Note {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize?: number | null;
  subjectId?: string | null;
  assignToAll: boolean;
  createdAt: string;
  subject?: Subject | null;
  uploader?: { id: string; name: string };
}

export interface Goal {
  id: string;
  studentId: string;
  title: string;
  description?: string | null;
  targetValue: number;
  currentValue: number;
  deadline?: string | null;
  status: "ACTIVE" | "COMPLETED" | "OVERDUE" | "CANCELLED";
  student?: StudentProfile;
}

export interface Activity {
  id: string;
  action: string;
  entityType: string;
  createdAt: string;
  user: { name: string; role: Role };
}
