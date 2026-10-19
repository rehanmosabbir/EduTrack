"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";

export function useTeacherDashboard() {
  return useQuery({
    queryKey: ["dashboard", "teacher"],
    queryFn: api.fetchTeacherDashboard,
  });
}

export function useStudentDashboard(studentId?: string) {
  return useQuery({
    queryKey: ["dashboard", "student", studentId],
    queryFn: () => api.fetchStudentDashboard(studentId),
  });
}

export function useGuardianDashboard(studentId?: string) {
  return useQuery({
    queryKey: ["dashboard", "guardian", studentId],
    queryFn: () => api.fetchGuardianDashboard(studentId),
  });
}

export function useStudents(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["students", params],
    queryFn: () => api.fetchStudents(params),
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ["student", id],
    queryFn: () => api.fetchStudent(id),
    enabled: !!id,
  });
}

export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: api.fetchSubjects,
  });
}

export function useGuardians(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["guardians", params],
    queryFn: () => api.fetchGuardians(params),
  });
}

export function useHomework(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["homework", params],
    queryFn: () => api.fetchHomework(params),
  });
}

export function useEvaluations(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["evaluations", params],
    queryFn: () => api.fetchEvaluations(params),
  });
}

export function useHistory(params: Record<string, unknown>, enabled = true) {
  return useQuery({
    queryKey: ["history", params],
    queryFn: () => api.fetchHistory(params),
    enabled,
  });
}

export function useProgress(params: Record<string, unknown>, enabled = true) {
  return useQuery({
    queryKey: ["progress", params],
    queryFn: () => api.fetchProgress(params),
    enabled,
  });
}

export function useComments(params: Record<string, unknown>, enabled = true) {
  return useQuery({
    queryKey: ["comments", params],
    queryFn: () => api.fetchComments(params),
    enabled,
  });
}

export function useUnansweredComments() {
  return useQuery({
    queryKey: ["comments", "unanswered"],
    queryFn: api.fetchUnansweredComments,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () =>
    qc.invalidateQueries().catch(() => undefined);
}

export function useCreateStudent() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: api.createStudent,
    onSuccess: async () => {
      await invalidate();
      toast.success("Student created");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateStudent() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      api.updateStudent(id, payload),
    onSuccess: async () => {
      await invalidate();
      toast.success("Student updated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useCreateSubject() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: api.createSubject,
    onSuccess: async () => {
      await invalidate();
      toast.success("Subject created");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useCreateGuardian() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: api.createGuardian,
    onSuccess: async () => {
      await invalidate();
      toast.success("Guardian created");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useLinkGuardian() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: api.linkGuardian,
    onSuccess: async () => {
      await invalidate();
      toast.success("Guardian linked");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useCreateHomework() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: api.createHomework,
    onSuccess: async () => {
      await invalidate();
      toast.success("Homework assigned");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateHomework() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      api.updateHomework(id, payload),
    onSuccess: async () => {
      await invalidate();
      toast.success("Homework updated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useCreateEvaluation() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: api.createEvaluation,
    onSuccess: async () => {
      await invalidate();
      toast.success("Evaluation saved");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useCreateComment() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: api.createComment,
    onSuccess: async () => {
      await invalidate();
      toast.success("Comment sent");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: api.fetchMe,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateProfile,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Profile updated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: api.changePassword,
    onSuccess: () => toast.success("Password changed"),
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: api.fetchNotificationPreferences,
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateNotificationPreferences,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("Notification preferences saved");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
