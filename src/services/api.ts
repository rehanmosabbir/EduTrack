import { api, type ApiSuccess } from "@/lib/api";
import type {
  GuardianComment,
  HomeworkAssignment,
  LessonEvaluation,
  Student,
  Subject,
} from "@/types";

export async function fetchTeacherDashboard() {
  const { data } = await api.get<ApiSuccess<Record<string, unknown>>>(
    "/dashboard/teacher",
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

export async function fetchGuardianDashboard(studentId?: string) {
  const { data } = await api.get<ApiSuccess<Record<string, unknown>>>(
    "/dashboard/guardian",
    { params: studentId ? { studentId } : undefined },
  );
  return data.data;
}

export async function fetchStudents(params?: Record<string, unknown>) {
  const { data } = await api.get<ApiSuccess<Student[]>>("/students", { params });
  return { items: data.data, meta: data.meta };
}

export async function fetchStudent(id: string) {
  const { data } = await api.get<ApiSuccess<Student>>(`/students/${id}`);
  return data.data;
}

export async function createStudent(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiSuccess<Student>>("/students", payload);
  return data.data;
}

export async function updateStudent(id: string, payload: Record<string, unknown>) {
  const { data } = await api.put<ApiSuccess<Student>>(`/students/${id}`, payload);
  return data.data;
}

export async function fetchSubjects() {
  const { data } = await api.get<ApiSuccess<Subject[]>>("/subjects");
  return data.data;
}

export async function createSubject(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiSuccess<Subject>>("/subjects", payload);
  return data.data;
}

export async function fetchGuardians(params?: Record<string, unknown>) {
  const { data } = await api.get<ApiSuccess<unknown[]>>("/guardians", { params });
  return { items: data.data, meta: data.meta };
}

export async function createGuardian(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiSuccess<unknown>>("/guardians", payload);
  return data.data;
}

export async function linkGuardian(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiSuccess<unknown>>("/guardians/link", payload);
  return data.data;
}

export async function fetchHomework(params?: Record<string, unknown>) {
  const { data } = await api.get<ApiSuccess<HomeworkAssignment[]>>("/homework", {
    params,
  });
  return { items: data.data, meta: data.meta };
}

export async function createHomework(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiSuccess<HomeworkAssignment>>(
    "/homework",
    payload,
  );
  return data.data;
}

export async function updateHomework(id: string, payload: Record<string, unknown>) {
  const { data } = await api.put<ApiSuccess<HomeworkAssignment>>(
    `/homework/${id}`,
    payload,
  );
  return data.data;
}

export async function fetchEvaluations(params?: Record<string, unknown>) {
  const { data } = await api.get<ApiSuccess<LessonEvaluation[]>>("/evaluations", {
    params,
  });
  return { items: data.data, meta: data.meta };
}

export async function createEvaluation(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiSuccess<LessonEvaluation>>(
    "/evaluations",
    payload,
  );
  return data.data;
}

export async function updateEvaluation(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data } = await api.put<ApiSuccess<LessonEvaluation>>(
    `/evaluations/${id}`,
    payload,
  );
  return data.data;
}

export async function fetchHistory(params: Record<string, unknown>) {
  const { data } = await api.get<ApiSuccess<LessonEvaluation[]>>("/history", {
    params,
  });
  return { items: data.data, meta: data.meta };
}

export async function fetchProgress(params: Record<string, unknown>) {
  const { data } = await api.get<ApiSuccess<Record<string, unknown>>>("/progress", {
    params,
  });
  return data.data;
}

export async function fetchComments(params: Record<string, unknown>) {
  const { data } = await api.get<ApiSuccess<GuardianComment[]>>("/comments", {
    params,
  });
  return { items: data.data, meta: data.meta };
}

export async function fetchUnansweredComments() {
  const { data } = await api.get<ApiSuccess<GuardianComment[]>>(
    "/comments/unanswered",
  );
  return data.data;
}

export async function createComment(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiSuccess<GuardianComment>>(
    "/comments",
    payload,
  );
  return data.data;
}
