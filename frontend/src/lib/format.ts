export function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
}

export function formatMarks(
  obtained?: number | null,
  maximum?: number | null,
) {
  if (obtained == null || maximum == null) return "Not recorded";
  return `${obtained}/${maximum}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
