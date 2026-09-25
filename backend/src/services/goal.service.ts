import { GoalStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { Errors } from "../utils/AppError.js";
import { ACTIVITY_ACTIONS, logActivity } from "./activity.service.js";

function parseOptionalDate(value?: string | null) {
  if (!value) return null;
  return new Date(value);
}

function deriveStatus(
  status: GoalStatus | undefined,
  currentValue: number,
  targetValue: number,
  deadline: Date | null,
): GoalStatus {
  if (status === GoalStatus.CANCELLED) return GoalStatus.CANCELLED;
  if (currentValue >= targetValue) return GoalStatus.COMPLETED;
  if (deadline && deadline < new Date() && currentValue < targetValue) {
    return GoalStatus.OVERDUE;
  }
  return status ?? GoalStatus.ACTIVE;
}

export async function listGoals(params: {
  studentId?: string;
  status?: GoalStatus;
  page: number;
  limit: number;
}) {
  const { studentId, status, page, limit } = params;
  const skip = (page - 1) * limit;
  const where = {
    ...(studentId ? { studentId } : {}),
    ...(status ? { status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.goal.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    }),
    prisma.goal.count({ where }),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getGoal(id: string) {
  const goal = await prisma.goal.findUnique({
    where: { id },
    include: {
      student: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!goal) throw Errors.notFound("Goal not found");
  return goal;
}

export async function createGoal(
  input: {
    studentId: string;
    title: string;
    description?: string;
    targetValue: number;
    currentValue?: number;
    deadline?: string | null;
    status?: GoalStatus;
  },
  actorId: string,
) {
  const currentValue = input.currentValue ?? 0;
  const deadline = parseOptionalDate(input.deadline);
  const status = deriveStatus(
    input.status,
    currentValue,
    input.targetValue,
    deadline,
  );

  const goal = await prisma.goal.create({
    data: {
      studentId: input.studentId,
      title: input.title,
      description: input.description,
      targetValue: input.targetValue,
      currentValue,
      deadline,
      status,
    },
    include: {
      student: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  await logActivity({
    userId: actorId,
    action: ACTIVITY_ACTIONS.GOAL_CREATED,
    entityType: "Goal",
    entityId: goal.id,
  });

  return goal;
}

export async function updateGoal(
  id: string,
  input: {
    title?: string;
    description?: string;
    targetValue?: number;
    currentValue?: number;
    deadline?: string | null;
    status?: GoalStatus;
  },
  actorId: string,
) {
  const existing = await getGoal(id);
  const targetValue = input.targetValue ?? existing.targetValue;
  const currentValue = input.currentValue ?? existing.currentValue;
  const deadline =
    input.deadline === undefined
      ? existing.deadline
      : parseOptionalDate(input.deadline);
  const status = deriveStatus(
    input.status ?? existing.status,
    currentValue,
    targetValue,
    deadline,
  );

  const goal = await prisma.goal.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      targetValue: input.targetValue,
      currentValue: input.currentValue,
      deadline: input.deadline === undefined ? undefined : deadline,
      status,
    },
    include: {
      student: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  await logActivity({
    userId: actorId,
    action: ACTIVITY_ACTIONS.GOAL_UPDATED,
    entityType: "Goal",
    entityId: id,
  });

  return goal;
}

export async function deleteGoal(id: string) {
  await getGoal(id);
  await prisma.goal.delete({ where: { id } });
  return { id };
}
