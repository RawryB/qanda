"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getRules(formId: string) {
  return await prisma.qandaLogicRule.findMany({
    where: { formId },
    include: {
      sourceQuestion: {
        select: {
          id: true,
          title: true,
          key: true,
          order: true,
        },
      },
    },
    orderBy: [
      { sourceQuestion: { order: "asc" } },
      { priority: "asc" },
    ],
  });
}

export async function createRule(formId: string, formData: FormData) {
  const sourceQuestionId = formData.get("sourceQuestionId") as string;
  const operator = formData.get("operator") as string;
  const compareValue = formData.get("compareValue") as string | null;
  const destinationType = formData.get("destinationType") as string;
  const destinationQuestionId = formData.get("destinationQuestionId") as string | null;

  // Validation
  if (!sourceQuestionId || !operator) {
    throw new Error("Source question and operator are required");
  }

  // Validate operator-specific requirements
  if (operator === "is_true" || operator === "is_false" || operator === "any") {
    // compareValue not used for these operators
  } else {
    if (!compareValue || compareValue.trim() === "") {
      throw new Error("Compare value is required for this operator");
    }
  }

  // Validate destination
  let isEnd = false;
  let finalDestinationQuestionId: string | null = null;

  if (destinationType === "end") {
    isEnd = true;
    finalDestinationQuestionId = null;
  } else if (destinationType === "question") {
    if (!destinationQuestionId) {
      throw new Error("Destination question is required");
    }
    // Prevent infinite loops
    if (destinationQuestionId === sourceQuestionId) {
      throw new Error("Destination question cannot be the same as source question");
    }
    isEnd = false;
    finalDestinationQuestionId = destinationQuestionId;
  } else {
    throw new Error("Invalid destination type");
  }

  // Get max priority for this source question
  const maxPriorityRule = await prisma.qandaLogicRule.findFirst({
    where: {
      formId,
      sourceQuestionId,
    },
    orderBy: {
      priority: "desc",
    },
  });

  const priority = maxPriorityRule ? maxPriorityRule.priority + 1 : 0;

  await prisma.qandaLogicRule.create({
    data: {
      formId,
      sourceQuestionId,
      operator,
      compareValue: ["is_true", "is_false", "any"].includes(operator) ? null : compareValue,
      destinationQuestionId: finalDestinationQuestionId,
      isEnd,
      priority,
    },
  });

  revalidatePath(`/admin/qanda/forms/${formId}/rules`);
}

export async function updateRule(ruleId: string, formId: string, formData: FormData) {
  const sourceQuestionId = formData.get("sourceQuestionId") as string;
  const operator = formData.get("operator") as string;
  const compareValue = formData.get("compareValue") as string | null;
  const destinationType = formData.get("destinationType") as string;
  const destinationQuestionId = formData.get("destinationQuestionId") as string | null;

  // Validation (same as create)
  if (!sourceQuestionId || !operator) {
    throw new Error("Source question and operator are required");
  }

  if (operator === "is_true" || operator === "is_false" || operator === "any") {
    // compareValue not used for these operators
  } else {
    if (!compareValue || compareValue.trim() === "") {
      throw new Error("Compare value is required for this operator");
    }
  }

  let isEnd = false;
  let finalDestinationQuestionId: string | null = null;

  if (destinationType === "end") {
    isEnd = true;
    finalDestinationQuestionId = null;
  } else if (destinationType === "question") {
    if (!destinationQuestionId) {
      throw new Error("Destination question is required");
    }
    if (destinationQuestionId === sourceQuestionId) {
      throw new Error("Destination question cannot be the same as source question");
    }
    isEnd = false;
    finalDestinationQuestionId = destinationQuestionId;
  } else {
    throw new Error("Invalid destination type");
  }

  await prisma.qandaLogicRule.update({
    where: { id: ruleId },
    data: {
      sourceQuestionId,
      operator,
      compareValue: ["is_true", "is_false", "any"].includes(operator) ? null : compareValue,
      destinationQuestionId: finalDestinationQuestionId,
      isEnd,
    },
  });

  revalidatePath(`/admin/qanda/forms/${formId}/rules`);
}

export async function deleteRule(ruleId: string, formId: string) {
  await prisma.qandaLogicRule.delete({
    where: { id: ruleId },
  });

  revalidatePath(`/admin/qanda/forms/${formId}/rules`);
}

export async function moveRule(
  formId: string,
  ruleId: string,
  direction: "up" | "down"
) {
  const rule = await prisma.qandaLogicRule.findUnique({
    where: { id: ruleId },
  });

  if (!rule) {
    throw new Error("Rule not found");
  }

  // Get all rules for the same source question, ordered by priority
  const allRules = await prisma.qandaLogicRule.findMany({
    where: {
      formId,
      sourceQuestionId: rule.sourceQuestionId,
    },
    orderBy: { priority: "asc" },
  });

  const currentIndex = allRules.findIndex((r) => r.id === ruleId);

  if (currentIndex === -1) {
    throw new Error("Rule not found in list");
  }

  let targetIndex: number;
  if (direction === "up") {
    if (currentIndex === 0) {
      return; // Already at top
    }
    targetIndex = currentIndex - 1;
  } else {
    if (currentIndex === allRules.length - 1) {
      return; // Already at bottom
    }
    targetIndex = currentIndex + 1;
  }

  const targetRule = allRules[targetIndex];

  // Swap priorities
  await prisma.$transaction([
    prisma.qandaLogicRule.update({
      where: { id: ruleId },
      data: { priority: targetRule.priority },
    }),
    prisma.qandaLogicRule.update({
      where: { id: targetRule.id },
      data: { priority: rule.priority },
    }),
  ]);

  revalidatePath(`/admin/qanda/forms/${formId}/rules`);
}
