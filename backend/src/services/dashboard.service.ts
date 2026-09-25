import { format, startOfDay, subDays } from "date-fns";
import { prisma } from "../lib/prisma.js";
import { totalStudyMinutes } from "../utils/grading.js";
import { getScoreStats } from "./score.service.js";
import { getStudyStats, getStudyTrend } from "./studyStats.service.js";

export async function getAdminDashboard() {
  const today = startOfDay(new Date());

  const [
    totalStudents,
    activeStudents,
    todayLogs,
    allScores,
    recentScores,
    recentActivities,
    studyTrend,
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.studentProfile.count({ where: { isActive: true } }),
    prisma.studyLog.findMany({ where: { date: today } }),
    prisma.score.findMany({ select: { percentage: true, examDate: true } }),
    prisma.score.findMany({
      take: 8,
      orderBy: { updatedAt: "desc" },
      include: {
        subject: true,
        student: {
          include: { user: { select: { name: true } } },
        },
      },
    }),
    prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, role: true } },
      },
    }),
    getStudyTrend(undefined, 14),
  ]);

  const todayStudyMinutes = todayLogs.reduce(
    (a, l) => a + totalStudyMinutes(l.studyHours, l.studyMinutes),
    0,
  );

  const last30 = await prisma.studyLog.findMany({
    where: { date: { gte: subDays(today, 29) } },
  });
  const avgStudyMinutes =
    last30.length > 0
      ? Math.round(
          last30.reduce(
            (a, l) => a + totalStudyMinutes(l.studyHours, l.studyMinutes),
            0,
          ) / new Set(last30.map((l) => format(l.date, "yyyy-MM-dd"))).size,
        )
      : 0;

  const avgScore =
    allScores.length > 0
      ? Math.round(
          (allScores.reduce((a, s) => a + s.percentage, 0) / allScores.length) *
            100,
        ) / 100
      : null;

  // Score trend by day (last 14 days average)
  const scoreTrendMap = new Map<string, number[]>();
  for (let i = 13; i >= 0; i--) {
    scoreTrendMap.set(format(subDays(today, i), "yyyy-MM-dd"), []);
  }
  for (const s of allScores) {
    const key = format(s.examDate, "yyyy-MM-dd");
    if (scoreTrendMap.has(key)) {
      scoreTrendMap.get(key)!.push(s.percentage);
    }
  }
  const scoreTrend = [...scoreTrendMap.entries()].map(([date, vals]) => ({
    date,
    average:
      vals.length > 0
        ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) /
          100
        : null,
  }));

  // Students needing attention: low avg score or low study this week
  const students = await prisma.studentProfile.findMany({
    where: { isActive: true },
    include: {
      user: { select: { name: true, email: true } },
      scores: { select: { percentage: true } },
      studyLogs: {
        where: { date: { gte: subDays(today, 7) } },
      },
    },
  });

  const needingAttention = students
    .map((s) => {
      const avg =
        s.scores.length > 0
          ? s.scores.reduce((a, x) => a + x.percentage, 0) / s.scores.length
          : null;
      const weekMins = s.studyLogs.reduce(
        (a, l) => a + totalStudyMinutes(l.studyHours, l.studyMinutes),
        0,
      );
      const reasons: string[] = [];
      if (avg !== null && avg < 60) reasons.push("Low average score");
      if (weekMins < 300) reasons.push("Low study hours this week");
      return {
        id: s.id,
        name: s.user.name,
        email: s.user.email,
        avgScore: avg !== null ? Math.round(avg * 100) / 100 : null,
        weekMinutes: weekMins,
        reasons,
      };
    })
    .filter((s) => s.reasons.length > 0)
    .slice(0, 8);

  return {
    kpis: {
      totalStudents,
      activeStudents,
      avgStudyMinutes,
      avgStudyFormatted: `${Math.floor(avgStudyMinutes / 60)}h ${avgStudyMinutes % 60}m`,
      avgScore,
      todayStudyMinutes,
      todayStudyFormatted: `${Math.floor(todayStudyMinutes / 60)}h ${todayStudyMinutes % 60}m`,
    },
    studyTrend,
    scoreTrend,
    recentScores,
    recentActivities,
    needingAttention,
  };
}

export async function getStudentDashboard(studentId: string) {
  const [studyStats, scoreStats, studyTrend, todayGoal] = await Promise.all([
    getStudyStats(studentId),
    getScoreStats(studentId),
    getStudyTrend(studentId, 30),
    prisma.goal.findFirst({
      where: { studentId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const dailyTargetMinutes = todayGoal
    ? Math.round(todayGoal.targetValue * 60)
    : 5 * 60;

  return {
    studyStats,
    scoreStats,
    studyTrend,
    todayTargetMinutes: dailyTargetMinutes,
    todayProgressPct: Math.min(
      100,
      Math.round((studyStats.todayMinutes / dailyTargetMinutes) * 100),
    ),
    activeGoal: todayGoal,
  };
}
