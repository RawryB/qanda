import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { renderTemplate } from "@/lib/qanda/template";
import { answersToValueMap } from "@/lib/qanda/answers";

export async function POST(request: Request) {
  try {
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
    }

    // Load submission and verify it exists and is in progress
    const submission = await prisma.qandaSubmission.findUnique({
      where: { id: submissionId },
      include: {
        form: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.status === "completed") {
      return NextResponse.json({ error: "Submission already completed" }, { status: 400 });
    }

    // Load nav steps for submission ordered by stepIndex desc
    const navSteps = await prisma.qandaNavStep.findMany({
      where: { submissionId },
      orderBy: { stepIndex: "desc" },
    });

    // If there is only 0 or 1 step, return atStart
    if (navSteps.length <= 1) {
      return NextResponse.json({ atStart: true });
    }

    // Identify current step (highest stepIndex)
    const currentStep = navSteps[0];

    // Delete that current step row (pop)
    await prisma.qandaNavStep.delete({
      where: { id: currentStep.id },
    });

    // Get the new current step (now the highest remaining stepIndex)
    const newCurrentStep = navSteps[1]; // Second highest after deletion

    // Load the question for the new current step
    const question = await prisma.qandaQuestion.findUnique({
      where: { id: newCurrentStep.questionId },
      include: {
        choices: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Load existing answer for that question
    const existingAnswer = await prisma.qandaAnswer.findUnique({
      where: {
        submissionId_questionId: {
          submissionId,
          questionId: question.id,
        },
      },
    });

    // Load all answers for template rendering (excluding downstream answers that may have been deleted)
    const allAnswers = await prisma.qandaAnswer.findMany({
      where: { submissionId },
      include: {
        question: {
          select: {
            key: true,
          },
        },
      },
    });

    // Build value map for template rendering
    const values = answersToValueMap(allAnswers);

    // Render template
    const renderedTitle = renderTemplate(question.title, values);
    const renderedHelpText = renderTemplate(question.helpText, values);

    // Build existingAnswer response
    let existingAnswerValue: any = null;
    if (existingAnswer) {
      if (existingAnswer.valueText !== null && existingAnswer.valueText !== undefined) {
        existingAnswerValue = existingAnswer.valueText;
      } else if (existingAnswer.valueJson !== null && existingAnswer.valueJson !== undefined) {
        existingAnswerValue = existingAnswer.valueJson;
      }
    }

    return NextResponse.json({
      question: {
        id: question.id,
        type: question.type,
        title: question.title,
        helpText: question.helpText,
        renderedTitle,
        renderedHelpText,
        required: question.required,
        key: question.key,
        choices: question.choices.map((c) => ({
          value: c.value,
          label: c.label,
        })),
      },
      stepIndex: newCurrentStep.stepIndex,
      existingAnswer: existingAnswerValue !== null ? { valueText: existingAnswer?.valueText || null, valueJson: existingAnswer?.valueJson || null } : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to go back" }, { status: 500 });
  }
}
