import { api, type ApiSuccess } from "@/lib/api";
import type {
  Activity,
  Goal,
  Note,
  Score,
  StudentProfile,
  StudyLog,
  Subject,
} from "@/types";

export async function fetchAdminDashboard() {
  const { data } = await api.get<ApiSuccess<Record<string, unknown>>>(
    "/dashboard/admin",
  );
  return data.data;
}

export async function fetchStudentDashboard(studentId?: string) {
  const { data } = await api.get<ApiSuccess<Record<string, unknown>>>(
    "/dashboard/student",
    { params: studentId ? { studentId } : undefined },
  );
  return data.data;
}

export async function fetchStudents(params?: Record<string, unknown>) {
  const { data } = await api.get<ApiSuccess<StudentProfile[]>>("/students", {
    params,
  });
  return { items: data.data, meta: data.meta };
}

export async function fetchStudent(id: string) {
  const { data } = await api.get<ApiSuccess<StudentProfile>>(`/students/${id}`);
  return data.data;
}

export async function fetchMyProfile() {
  const { data } = await api.get<ApiSuccess<StudentProfile>>("/students/me/profile");
  return data.data;
}

export async function createStudent(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiSuccess<unknown>>("/students", payload);
  return data.data;
}

export async function updateStudent(id: string, payload: Record<string, unknown>) {
  const { data } = await api.put<ApiSuccess<unknown>>(`/students/${id}`, payload);
  return data.data;
}

export async function deleteStudent(id: string) {
  const { data } = await api.delete<ApiSuccess<{ id: string }>>(`/students/${id}`);
  return data.data;
}

export async function fetchSubjects(params?: Record<string, unknown>) {
  const { data } = await api.get<ApiSuccess<Subject[]>>("/subjects", { params });
  return { items: data.data, meta: data.meta };
}

export async function createSubject(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiSuccess<Subject>>("/subjects", payload);
  return data.data;
}

export async function updateSubject(id: string, payload: Record<string, unknown>) {
  const { data } = await api.put<ApiSuccess<Subject>>(`/subjects/${id}`, payload);
  return data.data;
}

export async function deleteSubject(id: string) {
  const { data } = await api.delete<ApiSuccess<{ id: string }>>(`/subjects/${id}`);
  return data.data;
}

export async function fetchStudyLogs(params?: Record<string, unknown>) {
  const { data } = await api.get<ApiSuccess<StudyLog[]>>("/study-logs", { params });
  return { items: data.data, meta: data.meta };
}

export async function upsertStudyLog(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiSuccess<StudyLog>>("/study-logs", payload);
  return data.data;
}

export async function updateStudyLog(id: string, payload: Record<string, unknown>) {
  const { data } = await api.put<ApiSuccess<StudyLog>>(`/study-logs/${id}`, payload);
  return data.data;
}

export async function deleteStudyLog(id: string) {
  const { data } = await api.delete<ApiSuccess<{ id: string }>>(`/study-logs/${id}`);
  return data.data;
}

export async function fetchStudyStats(studentId?: string) {
  const { data } = await api.get<ApiSuccess<Record<string, unknown>>>(
    "/study-logs/stats",
    { params: studentId ? { studentId } : undefined },
  );
  return data.data;
}

export async function fetchStudyTrend(params?: Record<string, unknown>) {
  const { data } = await api.get<ApiSuccess<Array<{ date: string; hours: number }>>>(
    "/study-logs/trend",
    { params },
  );
  return data.data;
}

export async function fetchCalendar(params: {
  studentId?: string;
  year: number;
  month: number;
}) {
  const { data } = await api.get<
    ApiSuccess<
      Array<{
        date: string;
        totalMinutes: number;
        studyHours: number;
        studyMinutes: number;
        description?: string | null;
        id: string;
      }>
    >
  >("/study-logs/calendar", { params });
  return data.data;
}

export async function fetchScores(params?: Record<string, unknown>) {
  const { data } = await api.get<ApiSuccess<Score[]>>("/scores", { params });
  return { items: data.data, meta: data.meta };
}

export async function createScore(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiSuccess<Score>>("/scores", payload);
  return data.data;
}

export async function updateScore(id: string, payload: Record<string, unknown>) {
  const { data } = await api.put<ApiSuccess<Score>>(`/scores/${id}`, payload);
  return data.data;
}

export async function deleteScore(id: string) {
  const { data } = await api.delete<ApiSuccess<{ id: string }>>(`/scores/${id}`);
  return data.data;
}

export async function fetchScoreStats(params?: Record<string, unknown>) {
  const { data } = await api.get<ApiSuccess<Record<string, unknown>>>(
    "/scores/stats",
    { params },
  );
  return data.data;
}

export async function fetchNotes(params?: Record<string, unknown>) {
  const { data } = await api.get<ApiSuccess<Note[]>>("/notes", { params });
  return { items: data.data, meta: data.meta };
}

export async function uploadNote(formData: FormData) {
  const { data } = await api.post<ApiSuccess<Note>>("/notes", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function deleteNote(id: string) {
  const { data } = await api.delete<ApiSuccess<{ id: string }>>(`/notes/${id}`);
  return data.data;
}

export async function downloadNote(id: string, fileName: string) {
  const res = await api.get(`/notes/${id}/download`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

export async function fetchGoals(params?: Record<string, unknown>) {
  const { data } = await api.get<ApiSuccess<Goal[]>>("/goals", { params });
  return { items: data.data, meta: data.meta };
}

export async function createGoal(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiSuccess<Goal>>("/goals", payload);
  return data.data;
}

export async function updateGoal(id: string, payload: Record<string, unknown>) {
  const { data } = await api.put<ApiSuccess<Goal>>(`/goals/${id}`, payload);
  return data.data;
}

export async function deleteGoal(id: string) {
  const { data } = await api.delete<ApiSuccess<{ id: string }>>(`/goals/${id}`);
  return data.data;
}

export async function fetchActivities(params?: Record<string, unknown>) {
  const { data } = await api.get<ApiSuccess<Activity[]>>("/activities", {
    params,
  });
  return { items: data.data, meta: data.meta };
}

export async function fetchReport(params?: Record<string, unknown>) {
  const { data } = await api.get<ApiSuccess<Record<string, unknown>>>("/reports", {
    params,
  });
  return data.data;
}

export async function exportReportCsv(params?: Record<string, unknown>) {
  const res = await api.get("/reports/export.csv", {
    params,
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = "edutrack-report.csv";
  a.click();
  window.URL.revokeObjectURL(url);
}
