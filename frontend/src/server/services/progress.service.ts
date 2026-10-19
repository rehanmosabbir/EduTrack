import { prisma } from "@/server/lib/prisma";

/** Weighted subject average: sum(obtained) / sum(maximum) * 100. Null marks excluded. */
export function computeWeightedPercentage(
  rows: Array<{ marksObtained: number | null; maximumMarks: number | null }>,
) {
  let obtained = 0;
  let maximum = 0;
  let count = 0;
  for (const r of rows) {
    if (
      r.marksObtained === null ||
      r.marksObtained === undefined ||
      r.maximumMarks === null ||
      r.maximumMarks === undefined ||
      r.maximumMarks <= 0
    ) {
      continue;
    }
    obtained += r.marksObtained;
    maximum += r.maximumMarks;
    count += 1;
  }
  if (count === 0 || maximum === 0) {
    return { percentage: null as number | null, evaluationCount: 0, obtainedSum: 0, maximumSum: 0 };
  }
  return {
    percentage: Math.round((obtained / maximum) * 10000) / 100,
    evaluationCount: count,
    obtainedSum: obtained,
    maximumSum: maximum,
  };
}

export async function getSubjectProgress(
  studentId: string,
  from?: string,
  to?: string,
) {
  const where = {
    studentId,
    ...(from || to
      ? {
          evaluationDate: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const evaluations = await prisma.lessonEvaluation.findMany({
    where,
    include: { subject: true },
    orderBy: { evaluationDate: "asc" },
  });

  const bySubject = new Map<
    string,
    {
      subjectId: string;
      subjectName: string;
      rows: Array<{ marksObtained: number | null; maximumMarks: number | null }>;
    }
  >();

  for (const e of evaluations) {
    const key = e.subjectId;
    if (!bySubject.has(key)) {
      bySubject.set(key, {
        subjectId: e.subjectId,
        subjectName: e.subject.name,
        rows: [],
      });
    }
    bySubject.get(key)!.rows.push({
      marksObtained: e.marksObtained,
      maximumMarks: e.maximumMarks,
    });
  }

  const subjects = [...bySubject.values()].map((s) => ({
    subjectId: s.subjectId,
    subjectName: s.subjectName,
    ...computeWeightedPercentage(s.rows),
  }));

  const overall = computeWeightedPercentage(
    evaluations.map((e) => ({
      marksObtained: e.marksObtained,
      maximumMarks: e.maximumMarks,
    })),
  );

  const trend = evaluations
    .filter((e) => e.marksObtained != null && e.maximumMarks != null && e.maximumMarks > 0)
    .map((e) => ({
      date: e.evaluationDate.toISOString().slice(0, 10),
      subject: e.subject.name,
      lesson: e.lessonOrChapter,
      percentage:
        Math.round(((e.marksObtained as number) / (e.maximumMarks as number)) * 10000) /
        100,
      marksObtained: e.marksObtained,
      maximumMarks: e.maximumMarks,
    }));

  return { subjects, overall, trend, totalEvaluations: evaluations.length };
}
