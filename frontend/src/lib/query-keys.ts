/**
 * Centralized TanStack Query keys for all server state.
 * Keep Zustand limited to UI-only state (sidebar, etc.).
 */
export const queryKeys = {
  adminDashboard: ["dashboard", "admin"] as const,
  studentDashboard: (studentId?: string) =>
    ["dashboard", "student", studentId ?? "me"] as const,

  students: (params?: Record<string, unknown>) =>
    ["students", params ?? {}] as const,
  student: (id: string) => ["students", id] as const,
  myProfile: ["students", "me", "profile"] as const,

  subjects: (params?: Record<string, unknown>) =>
    ["subjects", params ?? {}] as const,

  studyLogs: (params?: Record<string, unknown>) =>
    ["study-logs", params ?? {}] as const,
  studyStats: (studentId?: string) =>
    ["study-logs", "stats", studentId ?? "me"] as const,
  studyTrend: (params?: Record<string, unknown>) =>
    ["study-logs", "trend", params ?? {}] as const,
  calendar: (year: number, month: number, studentId?: string) =>
    ["study-logs", "calendar", year, month, studentId ?? "me"] as const,

  scores: (params?: Record<string, unknown>) =>
    ["scores", params ?? {}] as const,
  scoreStats: (params?: Record<string, unknown>) =>
    ["scores", "stats", params ?? {}] as const,

  notes: (params?: Record<string, unknown>) =>
    ["notes", params ?? {}] as const,

  goals: (params?: Record<string, unknown>) =>
    ["goals", params ?? {}] as const,

  activities: (params?: Record<string, unknown>) =>
    ["activities", params ?? {}] as const,

  reports: (params?: Record<string, unknown>) =>
    ["reports", params ?? {}] as const,
} as const;
