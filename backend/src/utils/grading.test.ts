import { describe, expect, it } from "vitest";
import {
  calculatePercentage,
  determineGrade,
  totalStudyMinutes,
} from "./grading.js";

describe("grading utilities", () => {
  it("calculates percentage correctly", () => {
    expect(calculatePercentage(42, 50)).toBe(84);
    expect(calculatePercentage(0, 50)).toBe(0);
    expect(calculatePercentage(10, 0)).toBe(0);
  });

  it("determines Bangladesh-style grades", () => {
    expect(determineGrade(85)).toBe("A+");
    expect(determineGrade(72)).toBe("A");
    expect(determineGrade(65)).toBe("A-");
    expect(determineGrade(55)).toBe("B");
    expect(determineGrade(45)).toBe("C");
    expect(determineGrade(35)).toBe("D");
    expect(determineGrade(20)).toBe("F");
  });

  it("sums study minutes", () => {
    expect(totalStudyMinutes(3, 25)).toBe(205);
  });
});
