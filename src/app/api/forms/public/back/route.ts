import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { renderTemplate } from "@/lib/qanda/template";
import { answersToValueMap } from "@/lib/qanda/answers";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function POST(request: Request) {
  try {
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
    }

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

    const navSteps = await prisma.qandaNavStep.findMany({
      where: { submissionId },
      orderBy: { stepIndex: "desc" },
    });

    if (navSteps.length <= 1) {
      return NextResponse.json({ atStart: true });
    }

    const currentStep = navSteps[0];

    await prisma.qandaNavStep.delete({
      where: { id: currentStep.id },
    });

    const newCurrentStep = navSteps[1];

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

    const existingAnswer = await prisma.qandaAnswer.findUnique({
      where: {
        submissionId_questionId: {
          submissionId,
          questionId: question.id,
        },
      },
    });

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

    const totalQuestions = await prisma.qandaQuestion.count({
      where: { formId: submission.formId },
    });

    const values = answersToValueMap(allAnswers);
    const renderedTitle = renderTemplate(question.title, values);
    const renderedHelpText = renderTemplate(question.helpText, values);

    let existingAnswerValue: unknown = null;
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
      totalQuestions,
      existingAnswer:
        existingAnswerValue !== null
          ? { valueText: existingAnswer?.valueText || null, valueJson: existingAnswer?.valueJson || null }
          : null,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Failed to go back") }, { status: 500 });
  }
}

