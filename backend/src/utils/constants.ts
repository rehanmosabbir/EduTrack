export const ROLES = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

export const STAFF_ROLES: RoleType[] = [ROLES.ADMIN, ROLES.TEACHER];

export const GRADING_BANDS = [
  { grade: "A+", min: 80 },
  { grade: "A", min: 70 },
  { grade: "A-", min: 60 },
  { grade: "B", min: 50 },
  { grade: "C", min: 40 },
  { grade: "D", min: 33 },
  { grade: "F", min: 0 },
] as const;

export const ALLOWED_NOTE_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/zip",
  "application/x-zip-compressed",
] as const;

export const ACTIVITY_ACTIONS = {
  SCORE_CREATED: "SCORE_CREATED",
  SCORE_UPDATED: "SCORE_UPDATED",
  SCORE_DELETED: "SCORE_DELETED",
  STUDY_LOG_CREATED: "STUDY_LOG_CREATED",
  STUDY_LOG_UPDATED: "STUDY_LOG_UPDATED",
  STUDY_LOG_DELETED: "STUDY_LOG_DELETED",
  NOTE_UPLOADED: "NOTE_UPLOADED",
  NOTE_DELETED: "NOTE_DELETED",
  STUDENT_CREATED: "STUDENT_CREATED",
  STUDENT_UPDATED: "STUDENT_UPDATED",
  GOAL_CREATED: "GOAL_CREATED",
  GOAL_UPDATED: "GOAL_UPDATED",
} as const;
