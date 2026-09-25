"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useScores, useStudyCalendar } from "@/hooks/use-server-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function intensityClass(minutes: number) {
  if (minutes <= 0) return "bg-slate-100 text-slate-400";
  if (minutes < 120) return "bg-red-100 text-red-700";
  if (minutes < 240) return "bg-amber-100 text-amber-800";
  return "bg-emerald-100 text-emerald-800";
}

export default function StudentCalendarPage() {
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<string | null>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const year = cursor.getFullYear();
  const month = cursor.getMonth() + 1;

  const { data: calendar } = useStudyCalendar({ year, month });
  const { data: scores } = useScores({
    from: selected ?? undefined,
    to: selected ?? undefined,
    limit: 20,
  });

  const byDate = useMemo(() => {
    const map = new Map<
      string,
      {
        date: string;
        totalMinutes: number;
        studyHours: number;
        studyMinutes: number;
        description?: string | null;
        id: string;
      }
    >();
    for (const item of calendar ?? []) map.set(item.date, item);
    return map;
  }, [calendar]);

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = (getDay(monthStart) + 6) % 7;
  const selectedLog = selected ? byDate.get(selected) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Study Calendar</h1>
        <p className="text-sm text-slate-500">
          Intensity by study duration — click a day for details
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{format(cursor, "MMMM yyyy")}</CardTitle>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setCursor((d) => subMonths(d, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setCursor((d) => addMonths(d, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-500">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const log = byDate.get(key);
              const minutes = log?.totalMinutes ?? 0;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected(key)}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition",
                    intensityClass(minutes),
                    selected === key && "ring-2 ring-indigo-500",
                  )}
                >
                  <span className="font-medium">{format(day, "d")}</span>
                  <span className="text-[10px]">
                    {minutes > 0 ? `${Math.floor(minutes / 60)}h` : ""}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-emerald-100" /> High (≥4h)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-amber-100" /> Medium (2–4h)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-red-100" /> Low (&lt;2h)
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selected ? format(new Date(selected), "dd MMMM yyyy") : "Select a day"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {selectedLog ? (
            <>
              <p>
                <span className="text-slate-500">Study hours:</span>{" "}
                {selectedLog.studyHours}h {selectedLog.studyMinutes}m
              </p>
              <p>
                <span className="text-slate-500">Description:</span>{" "}
                {selectedLog.description || "—"}
              </p>
            </>
          ) : (
            <p className="text-slate-500">No study log for this day.</p>
          )}
          <div>
            <p className="mb-2 font-medium text-slate-700">Scores recorded</p>
            {(scores?.items ?? []).length === 0 ? (
              <p className="text-slate-500">No scores on this day.</p>
            ) : (
              <ul className="space-y-1">
                {scores!.items.map((s) => (
                  <li key={s.id}>
                    {s.subject?.name} — {s.examName}: {s.percentage}%
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
