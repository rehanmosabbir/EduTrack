export const ROLES = {
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  GUARDIAN: "GUARDIAN",
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

export const APP_TIMEZONE = "Asia/Dhaka";
