"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import * as api from "@/services/api";

type ListParams = Record<string, unknown> | undefined;

function onMutError(error: unknown) {
  toast.error(getErrorMessage(error));
}

/* ─── Dashboards ─────────────────────────────────────────── */

export function useAdminDashboard(
  options?: Partial<UseQueryOptions<Record<string, unknown>>>,
) {
  return useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: api.fetchAdminDashboard,
    ...options,
  });
}

export function useStudentDashboard(studentId?: string) {
  return useQuery({
    queryKey: queryKeys.studentDashboard(studentId),
    queryFn: () => api.fetchStudentDashboard(studentId),
  });
}

/* ─── Students ───────────────────────────────────────────── */

export function useStudents(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.students(params),
    queryFn: () => api.fetchStudents(params),
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: queryKeys.student(id),
    queryFn: () => api.fetchStudent(id),
    enabled: !!id,
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: queryKeys.myProfile,
    queryFn: api.fetchMyProfile,
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createStudent,
    onSuccess: () => {
      toast.success("Student created successfully.");
      void qc.invalidateQueries({ queryKey: ["students"] });
      void qc.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    },
    onError: onMutError,
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteStudent,
    onSuccess: () => {
      toast.success("Student deleted.");
      void qc.invalidateQueries({ queryKey: ["students"] });
      void qc.invalidateQueries({ queryKey: queryKeys.adminDashboard });
    },
    onError: onMutError,
  });
}

/* ─── Subjects ───────────────────────────────────────────── */

export function useSubjects(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.subjects(params),
    queryFn: () => api.fetchSubjects(params),
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createSubject,
    onSuccess: () => {
      toast.success("Subject created.");
      void qc.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: onMutError,
  });
}

export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteSubject,
    onSuccess: () => {
      toast.success("Subject deleted.");
      void qc.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: onMutError,
  });
}

/* ─── Study logs ─────────────────────────────────────────── */

export function useStudyLogs(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.studyLogs(params),
    queryFn: () => api.fetchStudyLogs(params),
  });
}

export function useStudyStats(studentId?: string) {
  return useQuery({
    queryKey: queryKeys.studyStats(studentId),
    queryFn: () => api.fetchStudyStats(studentId),
  });
}

export function useStudyTrend(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.studyTrend(params),
    queryFn: () => api.fetchStudyTrend(params),
  });
}

export function useStudyCalendar(params: {
  year: number;
  month: number;
  studentId?: string;
}) {
  return useQuery({
    queryKey: queryKeys.calendar(params.year, params.month, params.studentId),
    queryFn: () => api.fetchCalendar(params),
  });
}

export function useUpsertStudyLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.upsertStudyLog,
    onSuccess: () => {
      toast.success("Study progress saved successfully.");
      void qc.invalidateQueries({ queryKey: ["study-logs"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: onMutError,
  });
}

export function useDeleteStudyLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteStudyLog,
    onSuccess: () => {
      toast.success("Study log deleted.");
      void qc.invalidateQueries({ queryKey: ["study-logs"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: onMutError,
  });
}

/* ─── Scores ─────────────────────────────────────────────── */

export function useScores(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.scores(params),
    queryFn: () => api.fetchScores(params),
  });
}

export function useScoreStats(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.scoreStats(params),
    queryFn: () => api.fetchScoreStats(params),
  });
}

export function useSaveScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id?: string | null;
      values: Record<string, unknown>;
    }) => (id ? api.updateScore(id, values) : api.createScore(values)),
    onSuccess: (_data, vars) => {
      toast.success(
        vars.id ? "Score updated successfully." : "Score added successfully.",
      );
      void qc.invalidateQueries({ queryKey: ["scores"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: onMutError,
  });
}

export function useDeleteScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteScore,
    onSuccess: () => {
      toast.success("Score deleted.");
      void qc.invalidateQueries({ queryKey: ["scores"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: onMutError,
  });
}

/* ─── Notes ──────────────────────────────────────────────── */

export function useNotes(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.notes(params),
    queryFn: () => api.fetchNotes(params),
  });
}

export function useUploadNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.uploadNote,
    onSuccess: () => {
      toast.success("Note uploaded successfully.");
      void qc.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: onMutError,
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteNote,
    onSuccess: () => {
      toast.success("Note deleted.");
      void qc.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: onMutError,
  });
}

/* ─── Goals ──────────────────────────────────────────────── */

export function useGoals(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.goals(params),
    queryFn: () => api.fetchGoals(params),
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createGoal,
    onSuccess: () => {
      toast.success("Goal created.");
      void qc.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: onMutError,
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => api.updateGoal(id, payload),
    onSuccess: () => {
      toast.success("Goal updated.");
      void qc.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: onMutError,
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteGoal,
    onSuccess: () => {
      toast.success("Goal deleted.");
      void qc.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: onMutError,
  });
}

/* ─── Reports ────────────────────────────────────────────── */

export function useReport(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.reports(params),
    queryFn: () => api.fetchReport(params),
  });
}
