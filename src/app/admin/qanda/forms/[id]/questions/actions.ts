"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const QUESTION_TYPES = ["text", "email", "phone", "yesno", "multi", "dropdown"];

export async function createQuestion(formId: string, formData: FormData) {
  const type = formData.get("type") as string;
  const key = formData.get("key") as string;
  const title = formData.get("title") as string;
  const helpText = formData.get("helpText") as string | null;
  const required = formData.get("required") === "on";

  // Validate type
  if (!QUESTION_TYPES.includes(type)) {
    throw new Error("Invalid question type");
  }

  // Validate key format
  if (!/^[a-z0-9_]+$/.test(key)) {
    throw new Error("Key must contain only lowercase letters, numbers, and underscores");
  }

  // Get max order for this form
  const maxOrderResult = await prisma.qandaQuestion.findFirst({
    where: { formId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const newOrder = maxOrderResult ? maxOrderResult.order + 1 : 0;

  try {
    const question = await prisma.qandaQuestion.create({
      data: {
        formId,
        order: newOrder,
        type,
        key,
        title,
        helpText: helpText?.trim() || null,
        required,
      },
    });

    revalidatePath(`/admin/qanda/forms/${formId}`);
    return question.id; // Return question ID for redirect
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("A question with this key already exists in this form");
    }
    throw error;
  }
}

export async function updateQuestion(questionId: string, formData: FormData) {
  const type = formData.get("type") as string;
  const key = formData.get("key") as string;
  const title = formData.get("title") as string;
  const helpText = formData.get("helpText") as string | null;
  const required = formData.get("required") === "on";

  // Validate type
  if (!QUESTION_TYPES.includes(type)) {
    throw new Error("Invalid question type");
  }

  // Validate key format
  if (!/^[a-z0-9_]+$/.test(key)) {
    throw new Error("Key must contain only lowercase letters, numbers, and underscores");
  }

  // Get formId for revalidation
  const question = await prisma.qandaQuestion.findUnique({
    where: { id: questionId },
    select: { formId: true },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  try {
    await prisma.qandaQuestion.update({
      where: { id: questionId },
      data: {
        type,
        key,
        title,
        helpText: helpText?.trim() || null,
        required,
      },
    });

    revalidatePath(`/admin/qanda/forms/${question.formId}`);
    revalidatePath(`/admin/qanda/forms/${question.formId}/questions/${questionId}`);
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("A question with this key already exists in this form");
    }
    if (error.code === "P2025") {
      throw new Error("Question not found");
    }
    throw error;
  }
}

export async function deleteQuestion(questionId: string) {
  const question = await prisma.qandaQuestion.findUnique({
    where: { id: questionId },
    select: { formId: true },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  try {
    await prisma.qandaQuestion.delete({
      where: { id: questionId },
    });

    revalidatePath(`/admin/qanda/forms/${question.formId}`);
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new Error("Question not found");
    }
    throw error;
  }
}

export async function moveQuestion(
  formId: string,
  questionId: string,
  direction: "up" | "down"
) {
  const question = await prisma.qandaQuestion.findUnique({
    where: { id: questionId },
    select: { order: true },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  const targetOrder = direction === "up" ? question.order - 1 : question.order + 1;

  // Find the question at the target position
  const swapQuestion = await prisma.qandaQuestion.findFirst({
    where: {
      formId,
      order: targetOrder,
    },
  });

  if (!swapQuestion) {
    throw new Error("Cannot move question: already at the boundary");
  }

  // Swap orders
  await prisma.$transaction([
    prisma.qandaQuestion.update({
      where: { id: questionId },
      data: { order: targetOrder },
    }),
    prisma.qandaQuestion.update({
      where: { id: swapQuestion.id },
      data: { order: question.order },
    }),
  ]);

  revalidatePath(`/admin/qanda/forms/${formId}`);
}

export async function getQuestion(questionId: string) {
  return await prisma.qandaQuestion.findUnique({
    where: { id: questionId },
    include: {
      choices: {
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getQuestions(formId: string) {
  return await prisma.qandaQuestion.findMany({
    where: { formId },
    orderBy: { order: "asc" },
    include: {
      choices: {
        orderBy: { order: "asc" },
      },
    },
  });
}

// Choice actions
export async function createChoice(questionId: string, formData: FormData) {
  const value = formData.get("value") as string;
  const label = formData.get("label") as string;

  if (!value || !label) {
    throw new Error("Value and label are required");
  }

  // Get max order for this question
  const maxOrderResult = await prisma.qandaChoice.findFirst({
    where: { questionId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const newOrder = maxOrderResult ? maxOrderResult.order + 1 : 0;

  const question = await prisma.qandaQuestion.findUnique({
    where: { id: questionId },
    select: { formId: true },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  try {
    await prisma.qandaChoice.create({
      data: {
        questionId,
        order: newOrder,
        value: value.trim(),
        label: label.trim(),
      },
    });

    revalidatePath(`/admin/qanda/forms/${question.formId}/questions/${questionId}`);
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("A choice with this value already exists for this question");
    }
    throw error;
  }
}

export async function updateChoice(choiceId: string, formData: FormData) {
  const value = formData.get("value") as string;
  const label = formData.get("label") as string;

  if (!value || !label) {
    throw new Error("Value and label are required");
  }

  const choice = await prisma.qandaChoice.findUnique({
    where: { id: choiceId },
    include: {
      question: {
        select: { formId: true },
      },
    },
  });

  if (!choice) {
    throw new Error("Choice not found");
  }

  try {
    await prisma.qandaChoice.update({
      where: { id: choiceId },
      data: {
        value: value.trim(),
        label: label.trim(),
      },
    });

    revalidatePath(
      `/admin/qanda/forms/${choice.question.formId}/questions/${choice.questionId}`
    );
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("A choice with this value already exists for this question");
    }
    if (error.code === "P2025") {
      throw new Error("Choice not found");
    }
    throw error;
  }
}

export async function deleteChoice(choiceId: string) {
  const choice = await prisma.qandaChoice.findUnique({
    where: { id: choiceId },
    include: {
      question: {
        select: { formId: true },
      },
    },
  });

  if (!choice) {
    throw new Error("Choice not found");
  }

  try {
    await prisma.qandaChoice.delete({
      where: { id: choiceId },
    });

    revalidatePath(
      `/admin/qanda/forms/${choice.question.formId}/questions/${choice.questionId}`
    );
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new Error("Choice not found");
    }
    throw error;
  }
}

export async function moveChoice(
  questionId: string,
  choiceId: string,
  direction: "up" | "down"
) {
  const choice = await prisma.qandaChoice.findUnique({
    where: { id: choiceId },
    select: { order: true },
  });

  if (!choice) {
    throw new Error("Choice not found");
  }

  const targetOrder = direction === "up" ? choice.order - 1 : choice.order + 1;

  // Find the choice at the target position
  const swapChoice = await prisma.qandaChoice.findFirst({
    where: {
      questionId,
      order: targetOrder,
    },
  });

  if (!swapChoice) {
    throw new Error("Cannot move choice: already at the boundary");
  }

  const question = await prisma.qandaQuestion.findUnique({
    where: { id: questionId },
    select: { formId: true },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  // Swap orders
  await prisma.$transaction([
    prisma.qandaChoice.update({
      where: { id: choiceId },
      data: { order: targetOrder },
    }),
    prisma.qandaChoice.update({
      where: { id: swapChoice.id },
      data: { order: choice.order },
    }),
  ]);

  revalidatePath(`/admin/qanda/forms/${question.formId}/questions/${questionId}`);
}
