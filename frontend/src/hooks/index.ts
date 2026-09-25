/**
 * Server state → TanStack Query (`hooks/use-server-state.ts`)
 * UI state only → Zustand (`stores/uiStore.ts`)
 */
export {
  useAdminDashboard,
  useStudentDashboard,
  useStudents,
  useStudent,
  useMyProfile,
  useCreateStudent,
  useDeleteStudent,
  useSubjects,
  useCreateSubject,
  useDeleteSubject,
  useStudyLogs,
  useStudyStats,
  useStudyTrend,
  useStudyCalendar,
  useUpsertStudyLog,
  useDeleteStudyLog,
  useScores,
  useScoreStats,
  useSaveScore,
  useDeleteScore,
  useNotes,
  useUploadNote,
  useDeleteNote,
  useGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useReport,
} from "./use-server-state";
