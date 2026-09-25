import { GRADING_BANDS } from "./constants.js";

export function calculatePercentage(obtainedMarks: number, totalMarks: number): number {
  if (totalMarks <= 0) return 0;
  return Math.round((obtainedMarks / totalMarks) * 10000) / 100;
}

export function determineGrade(percentage: number): string {
  for (const band of GRADING_BANDS) {
    if (percentage >= band.min) return band.grade;
  }
  return "F";
}

export function totalStudyMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes;
}

export function formatStudyDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}
