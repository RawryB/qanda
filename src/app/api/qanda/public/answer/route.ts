import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function validateAnswer(value: any, question: any): { valid: boolean; error?: string } {
  if (question.required && (!value || value === "")) {
    return { valid: false, error: "This field is required" };
  }

  if (!question.required && (!value || value === "")) {
    return { valid: true };
  }

  switch (question.type) {
    case "email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, error: "Please enter a valid email address" };
      }
      break;

    case "phone":
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(value)) {
        return { valid: false, error: "Please enter a valid phone number" };
      }
      break;

    case "yesno":
      if (value !== "yes" && value !== "no" && value !== true && value !== false) {
        return { valid: false, error: "Please select yes or no" };
      }
      break;

    case "multi":
    case "dropdown":
      const choices = question.choices || [];
      if (choices.length === 0) {
        return { valid: false, error: "No choices configured for this question." };
      }
      const validValues = choices.map((c: any) => c.value);
      if (!validValues.includes(value)) {
        return { valid: false, error: "Please select a valid option" };
      }
      break;
  }

  return { valid: true };
}

export async function POST(request: Request) {
  try {
    const { submissionId, questionId, value } = await request.json();

    if (!submissionId || !questionId) {
      return NextResponse.json(
        { error: "submissionId and questionId are required" },
        { status: 400 }
      );
    }

    // Load submission and verify it's in progress
    const submission = await prisma.qandaSubmission.findUnique({
      where: { id: submissionId },
      include: {
        form: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.status !== "in_progress") {
      return NextResponse.json({ error: "Submission is already completed" }, { status: 400 });
    }

    // Load question with choices
    const question = await prisma.qandaQuestion.findUnique({
      where: { id: questionId },
      include: {
        choices: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Verify question belongs to the form
    if (question.formId !== submission.formId) {
      return NextResponse.json({ error: "Question does not belong to this form" }, { status: 400 });
    }

    // Validate answer
    const validation = validateAnswer(value, question);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Store answer
    const answerData: any = {
      submissionId,
      questionId,
    };

    if (question.type === "yesno") {
      answerData.valueJson = value === "yes" || value === true;
    } else if (question.type === "multi" || question.type === "dropdown") {
      answerData.valueText = value;
    } else {
      answerData.valueText = value;
    }

    await prisma.qandaAnswer.upsert({
      where: {
        submissionId_questionId: {
          submissionId,
          questionId,
        },
      },
      create: answerData,
      update: answerData,
    });

    // Find next question
    const nextQuestion = await prisma.qandaQuestion.findFirst({
      where: {
        formId: submission.formId,
        order: {
          gt: question.order,
        },
      },
      orderBy: {
        order: "asc",
      },
      include: {
        choices: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (nextQuestion) {
      return NextResponse.json({
        nextQuestion: {
          id: nextQuestion.id,
          type: nextQuestion.type,
          title: nextQuestion.title,
          helpText: nextQuestion.helpText,
          required: nextQuestion.required,
          key: nextQuestion.key,
          choices: nextQuestion.choices.map((c) => ({
            value: c.value,
            label: c.label,
          })),
        },
      });
    } else {
      return NextResponse.json({ completed: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save answer" }, { status: 500 });
  }
}
