import { describe, expect, it } from "vitest";
import { computeWeightedPercentage } from "@/server/services/progress.service";

describe("computeWeightedPercentage", () => {
  it("ignores missing marks instead of treating them as zero", () => {
    const result = computeWeightedPercentage([
      { marksObtained: 8, maximumMarks: 10 },
      { marksObtained: null, maximumMarks: null },
      { marksObtained: 9, maximumMarks: 10 },
    ]);
    expect(result.evaluationCount).toBe(2);
    expect(result.percentage).toBe(85);
  });

  it("returns null percentage when no scored evaluations exist", () => {
    const result = computeWeightedPercentage([
      { marksObtained: null, maximumMarks: null },
    ]);
    expect(result.percentage).toBeNull();
    expect(result.evaluationCount).toBe(0);
  });
});
