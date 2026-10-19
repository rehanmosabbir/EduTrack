import { describe, expect, it } from "vitest";
import { evaluationSchema, homeworkSchema } from "./schemas";

describe("evaluationSchema", () => {
  it("allows evaluations without marks", () => {
    const parsed = evaluationSchema.parse({
      studentId: "s1",
      subjectId: "sub1",
      evaluationDate: "2026-10-19",
      lessonOrChapter: "Algebra",
      preparationStatus: "PREPARED",
      homeworkStatus: "COMPLETED",
    });
    expect(parsed.marksObtained ?? null).toBeNull();
  });

  it("rejects obtained marks without maximum", () => {
    const result = evaluationSchema.safeParse({
      studentId: "s1",
      subjectId: "sub1",
      evaluationDate: "2026-10-19",
      lessonOrChapter: "Algebra",
      preparationStatus: "PREPARED",
      homeworkStatus: "COMPLETED",
      marksObtained: 5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects obtained > maximum", () => {
    const result = evaluationSchema.safeParse({
      studentId: "s1",
      subjectId: "sub1",
      evaluationDate: "2026-10-19",
      lessonOrChapter: "Algebra",
      preparationStatus: "PREPARED",
      homeworkStatus: "COMPLETED",
      marksObtained: 12,
      maximumMarks: 10,
    });
    expect(result.success).toBe(false);
  });
});

describe("homeworkSchema", () => {
  it("requires a single student and subject", () => {
    const parsed = homeworkSchema.parse({
      studentId: "s1",
      subjectId: "sub1",
      title: "Task",
      lessonOrChapter: "Ch1",
      instructions: "Do the work",
      assignedAt: "2026-10-19",
    });
    expect(parsed.studentId).toBe("s1");
  });
});
