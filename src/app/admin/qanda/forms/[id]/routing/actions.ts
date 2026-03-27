"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ConditionInput = {
  questionId: string;
  operator: string;
  value: string;
};

function parseConditionValue(operator: string, rawValue: string): string {
  if (operator !== "in") return rawValue;
  const parts = rawValue
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return JSON.stringify(parts);
}

function parseConditions(formData: FormData): ConditionInput[] {
  const questionIds = formData.getAll("conditionQuestionId").map(String);
  const operators = formData.getAll("conditionOperator").map(String);
  const values = formData.getAll("conditionValue").map(String);

  if (questionIds.length === 0) {
    throw new Error("At least one condition is required");
  }
  if (questionIds.length !== operators.length || questionIds.length !== values.length) {
    throw new Error("Condition rows are invalid");
  }

  const conditions: ConditionInput[] = [];
  for (let i = 0; i < questionIds.length; i += 1) {
    const questionId = questionIds[i];
    const operator = operators[i];
    const value = values[i];
    if (!questionId || !operator || !value) {
      throw new Error("Each condition requires question, operator, and value");
    }
    if (!["equals", "in"].includes(operator)) {
      throw new Error("Invalid condition operator");
    }
    conditions.push({
      questionId,
      operator,
      value: parseConditionValue(operator, value),
    });
  }
  return conditions;
}

export async function getOutcomeRules(formId: string) {
  return prisma.qandaOutcomeRule.findMany({
    where: { formId },
    include: {
      conditions: {
        include: {
          question: {
            select: {
              id: true,
              title: true,
              key: true,
              order: true,
            },
          },
        },
        orderBy: [{ question: { order: "asc" } }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  });
}

export async function createOutcomeRule(formId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const matchType = String(formData.get("matchType") || "all").trim();
  const destinationValue = String(formData.get("destinationValue") || "").trim();
  const segmentKeyRaw = String(formData.get("segmentKey") || "").trim();
  const segmentKey = segmentKeyRaw || null;

  if (!name) throw new Error("Rule name is required");
  if (!["all", "any"].includes(matchType)) throw new Error("Invalid match type");
  if (!destinationValue) throw new Error("Destination URL is required");
  if (!destinationValue.startsWith("/") && !/^https?:\/\//i.test(destinationValue)) {
    throw new Error("Destination must be a relative path or absolute URL");
  }

  const conditions = parseConditions(formData);

  const maxPriority = await prisma.qandaOutcomeRule.findFirst({
    where: { formId },
    orderBy: { priority: "desc" },
    select: { priority: true },
  });

  await prisma.qandaOutcomeRule.create({
    data: {
      formId,
      name,
      priority: (maxPriority?.priority ?? -1) + 1,
      isActive: true,
      matchType,
      destinationType: "redirect_url",
      destinationValue,
      segmentKey,
      conditions: {
        create: conditions.map((condition) => ({
          questionId: condition.questionId,
          operator: condition.operator,
          value: condition.value,
        })),
      },
    },
  });

  revalidatePath(`/admin/qanda/forms/${formId}`);
}

export async function updateOutcomeRule(formId: string, ruleId: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const matchType = String(formData.get("matchType") || "all").trim();
  const destinationValue = String(formData.get("destinationValue") || "").trim();
  const segmentKeyRaw = String(formData.get("segmentKey") || "").trim();
  const segmentKey = segmentKeyRaw || null;

  if (!name) throw new Error("Rule name is required");
  if (!["all", "any"].includes(matchType)) throw new Error("Invalid match type");
  if (!destinationValue) throw new Error("Destination URL is required");
  if (!destinationValue.startsWith("/") && !/^https?:\/\//i.test(destinationValue)) {
    throw new Error("Destination must be a relative path or absolute URL");
  }

  const conditions = parseConditions(formData);

  await prisma.$transaction(async (tx) => {
    await tx.qandaOutcomeRule.update({
      where: { id: ruleId },
      data: {
        name,
        matchType,
        destinationValue,
        segmentKey,
      },
    });

    await tx.qandaOutcomeCondition.deleteMany({
      where: { outcomeRuleId: ruleId },
    });

    await tx.qandaOutcomeCondition.createMany({
      data: conditions.map((condition) => ({
        outcomeRuleId: ruleId,
        questionId: condition.questionId,
        operator: condition.operator,
        value: condition.value,
      })),
    });
  });

  revalidatePath(`/admin/qanda/forms/${formId}`);
}

export async function deleteOutcomeRule(formId: string, ruleId: string) {
  await prisma.qandaOutcomeRule.delete({
    where: { id: ruleId },
  });
  revalidatePath(`/admin/qanda/forms/${formId}`);
}

export async function toggleOutcomeRule(formId: string, ruleId: string, isActive: boolean) {
  await prisma.qandaOutcomeRule.update({
    where: { id: ruleId },
    data: { isActive },
  });
  revalidatePath(`/admin/qanda/forms/${formId}`);
}

export async function moveOutcomeRule(formId: string, ruleId: string, direction: "up" | "down") {
  const rules = await prisma.qandaOutcomeRule.findMany({
    where: { formId },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
    select: { id: true, priority: true },
  });
  const currentIndex = rules.findIndex((rule) => rule.id === ruleId);
  if (currentIndex === -1) throw new Error("Rule not found");

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= rules.length) return;

  const current = rules[currentIndex];
  const target = rules[targetIndex];

  await prisma.$transaction([
    prisma.qandaOutcomeRule.update({
      where: { id: current.id },
      data: { priority: target.priority },
    }),
    prisma.qandaOutcomeRule.update({
      where: { id: target.id },
      data: { priority: current.priority },
    }),
  ]);

  revalidatePath(`/admin/qanda/forms/${formId}`);
}

export async function reorderOutcomeRule(
  formId: string,
  ruleId: string,
  targetPriority: number,
) {
  const rule = await prisma.qandaOutcomeRule.findUnique({
    where: { id: ruleId },
    select: { id: true, formId: true, priority: true },
  });

  if (!rule || rule.formId !== formId) {
    throw new Error("Rule not found");
  }

  const count = await prisma.qandaOutcomeRule.count({ where: { formId } });
  const boundedTarget = Math.max(0, Math.min(targetPriority, count - 1));

  if (boundedTarget === rule.priority) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    if (boundedTarget > rule.priority) {
      await tx.qandaOutcomeRule.updateMany({
        where: {
          formId,
          priority: {
            gt: rule.priority,
            lte: boundedTarget,
          },
        },
        data: {
          priority: { decrement: 1 },
        },
      });
    } else {
      await tx.qandaOutcomeRule.updateMany({
        where: {
          formId,
          priority: {
            gte: boundedTarget,
            lt: rule.priority,
          },
        },
        data: {
          priority: { increment: 1 },
        },
      });
    }

    await tx.qandaOutcomeRule.update({
      where: { id: ruleId },
      data: { priority: boundedTarget },
    });
  });

  revalidatePath(`/admin/qanda/forms/${formId}`);
}

export async function duplicateOutcomeRule(formId: string, ruleId: string) {
  const sourceRule = await prisma.qandaOutcomeRule.findUnique({
    where: { id: ruleId },
    include: {
      conditions: true,
    },
  });

  if (!sourceRule || sourceRule.formId !== formId) {
    throw new Error("Routing rule not found");
  }

  const maxPriority = await prisma.qandaOutcomeRule.findFirst({
    where: { formId },
    orderBy: { priority: "desc" },
    select: { priority: true },
  });

  await prisma.qandaOutcomeRule.create({
    data: {
      formId,
      name: `${sourceRule.name} (copy)`,
      priority: (maxPriority?.priority ?? -1) + 1,
      isActive: sourceRule.isActive,
      matchType: sourceRule.matchType,
      destinationType: sourceRule.destinationType,
      destinationValue: sourceRule.destinationValue,
      segmentKey: sourceRule.segmentKey,
      conditions: {
        create: sourceRule.conditions.map((condition) => ({
          questionId: condition.questionId,
          operator: condition.operator,
          value: condition.value,
        })),
      },
    },
  });

  revalidatePath(`/admin/qanda/forms/${formId}`);
}
