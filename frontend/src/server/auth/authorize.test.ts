import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/server/lib/prisma", () => ({
  prisma: {
    student: { findUnique: vi.fn() },
    studentGuardian: { findUnique: vi.fn(), findMany: vi.fn() },
  },
}));

import { prisma } from "@/server/lib/prisma";
import { assertCanAccessStudent } from "@/server/auth/authorize";
import { AppError } from "@/server/utils/AppError";

describe("assertCanAccessStudent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows teachers for existing students", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({ id: "s1" } as never);
    await expect(
      assertCanAccessStudent(
        {
          id: "t1",
          email: "t@x.com",
          name: "T",
          role: "TEACHER",
        },
        "s1",
      ),
    ).resolves.toBeUndefined();
  });

  it("blocks students from other profiles", async () => {
    await expect(
      assertCanAccessStudent(
        {
          id: "u1",
          email: "a@x.com",
          name: "A",
          role: "STUDENT",
          studentId: "s1",
        },
        "s2",
      ),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("blocks guardians without a link", async () => {
    vi.mocked(prisma.studentGuardian.findUnique).mockResolvedValue(null);
    await expect(
      assertCanAccessStudent(
        {
          id: "g1",
          email: "g@x.com",
          name: "G",
          role: "GUARDIAN",
          guardianId: "guard1",
        },
        "s9",
      ),
    ).rejects.toBeInstanceOf(AppError);
  });
});
