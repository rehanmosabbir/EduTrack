import {
  differenceInCalendarDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { prisma } from "../lib/prisma.js";
import { totalStudyMinutes } from "../utils/grading.js";

function toDateOnly(d: Date) {
  return startOfDay(d);
}

export async function getStudyStats(studentId: string, now = new Date()) {
  const todayStart = startOfDay(now);
  const yesterdayStart = startOfDay(subDays(now, 1));
  const weekStart = startOfWeek(now, { weekStartsOn: 6 }); // Sat (BD week often Sat-Fri) — use Mon for consistency
  const weekStartMon = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  const logs = await prisma.studyLog.findMany({
    where: {
      studentId,
      date: { gte: subDays(todayStart, 120) },
    },
    orderBy: { date: "asc" },
  });

  const minutesOf = (log: { studyHours: number; studyMinutes: number }) =>
    totalStudyMinutes(log.studyHours, log.studyMinutes);

  const todayLog = logs.find(
    (l) => format(l.date, "yyyy-MM-dd") === format(todayStart, "yyyy-MM-dd"),
  );
  const yesterdayLog = logs.find(
    (l) =>
      format(l.date, "yyyy-MM-dd") === format(yesterdayStart, "yyyy-MM-dd"),
  );

  const weekLogs = logs.filter((l) => l.date >= weekStartMon && l.date <= endOfWeek(now, { weekStartsOn: 1 }));
  const monthLogs = logs.filter((l) => l.date >= monthStart && l.date <= endOfMonth(now));

  const sumMinutes = (arr: typeof logs) =>
    arr.reduce((a, l) => a + minutesOf(l), 0);

  const todayMinutes = todayLog ? minutesOf(todayLog) : 0;
  const yesterdayMinutes = yesterdayLog ? minutesOf(yesterdayLog) : 0;
  const weeklyMinutes = sumMinutes(weekLogs);
  const monthlyMinutes = sumMinutes(monthLogs);

  const daysWithStudy = logs.filter((l) => minutesOf(l) > 0);
  const avgDailyMinutes =
    daysWithStudy.length > 0
      ? Math.round(sumMinutes(daysWithStudy) / daysWithStudy.length)
      : 0;

  // Streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let running = 0;
  const dateSet = new Set(
    daysWithStudy.map((l) => format(l.date, "yyyy-MM-dd")),
  );

  for (let i = 0; i < 365; i++) {
    const d = format(subDays(todayStart, i), "yyyy-MM-dd");
    if (dateSet.has(d)) {
      currentStreak += 1;
    } else if (i === 0) {
      continue; // today empty doesn't break yet until we check yesterday path; allow 0 today
    } else {
      break;
    }
  }
  // Recalculate current streak properly: count consecutive days ending today or yesterday
  currentStreak = 0;
  let cursor = dateSet.has(format(todayStart, "yyyy-MM-dd"))
    ? todayStart
    : yesterdayStart;
  if (
    dateSet.has(format(cursor, "yyyy-MM-dd")) ||
    dateSet.has(format(todayStart, "yyyy-MM-dd"))
  ) {
    if (!dateSet.has(format(todayStart, "yyyy-MM-dd"))) {
      cursor = yesterdayStart;
    } else {
      cursor = todayStart;
    }
    while (dateSet.has(format(cursor, "yyyy-MM-dd"))) {
      currentStreak += 1;
      cursor = subDays(cursor, 1);
    }
  }

  const sortedDates = [...dateSet].sort();
  let prev: string | null = null;
  for (const d of sortedDates) {
    if (!prev) {
      running = 1;
    } else {
      const gap = differenceInCalendarDays(new Date(d), new Date(prev));
      running = gap === 1 ? running + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, running);
    prev = d;
  }

  void weekStart; // reserved

  return {
    todayMinutes,
    yesterdayMinutes,
    weeklyMinutes,
    monthlyMinutes,
    avgDailyMinutes,
    currentStreak,
    longestStreak,
    todayFormatted: `${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}m`,
    weeklyFormatted: `${Math.floor(weeklyMinutes / 60)}h ${weeklyMinutes % 60}m`,
    monthlyFormatted: `${Math.floor(monthlyMinutes / 60)}h ${monthlyMinutes % 60}m`,
    avgDailyFormatted: `${Math.floor(avgDailyMinutes / 60)}h ${avgDailyMinutes % 60}m`,
  };
}

export async function getStudyTrend(
  studentId: string | undefined,
  days = 30,
  now = new Date(),
) {
  const from = startOfDay(subDays(now, days - 1));
  const logs = await prisma.studyLog.findMany({
    where: {
      ...(studentId ? { studentId } : {}),
      date: { gte: from, lte: endOfDay(now) },
    },
    orderBy: { date: "asc" },
  });

  const byDate = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    byDate.set(format(subDays(now, days - 1 - i), "yyyy-MM-dd"), 0);
  }
  for (const log of logs) {
    const key = format(log.date, "yyyy-MM-dd");
    const prev = byDate.get(key) ?? 0;
    byDate.set(
      key,
      prev + totalStudyMinutes(log.studyHours, log.studyMinutes) / 60,
    );
  }

  return [...byDate.entries()].map(([date, hours]) => ({
    date,
    hours: Math.round(hours * 100) / 100,
  }));
}

export async function getCalendarStudyData(
  studentId: string,
  year: number,
  month: number,
) {
  const from = new Date(year, month - 1, 1);
  const to = endOfMonth(from);
  const logs = await prisma.studyLog.findMany({
    where: { studentId, date: { gte: from, lte: to } },
    orderBy: { date: "asc" },
  });

  return logs.map((l) => ({
    date: format(l.date, "yyyy-MM-dd"),
    studyHours: l.studyHours,
    studyMinutes: l.studyMinutes,
    totalMinutes: totalStudyMinutes(l.studyHours, l.studyMinutes),
    description: l.description,
    id: l.id,
  }));
}

export { toDateOnly };
