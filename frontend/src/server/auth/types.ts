import type { RoleType } from "@/server/utils/constants";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: RoleType;
  image?: string | null;
  studentId?: string | null;
  guardianId?: string | null;
}
