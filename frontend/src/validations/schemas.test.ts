import { describe, expect, it } from "vitest";
import { studyLogSchema, scoreFormSchema } from "./schemas";

describe("form validation", () => {
  it("accepts a valid study log", () => {
    const result = studyLogSchema.safeParse({
      date: "2026-09-25",
      studyHours: 3,
      studyMinutes: 30,
      description: "Physics",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid study minutes", () => {
    const result = studyLogSchema.safeParse({
      date: "2026-09-25",
      studyHours: 1,
      studyMinutes: 90,
    });
    expect(result.success).toBe(false);
  });

  it("rejects obtained marks above total", () => {
    const result = scoreFormSchema.safeParse({
      studentId: "abc",
      subjectId: "xyz",
      examName: "Test",
      examDate: "2026-09-25",
      obtainedMarks: 60,
      totalMarks: 50,
    });
    expect(result.success).toBe(false);
  });
});
