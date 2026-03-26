import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { renderTemplate } from "@/lib/qanda/template";
import { answersToValueMap } from "@/lib/qanda/answers";
import { fireZapierOnCompletion } from "@/lib/qanda/webhook";

function validateAnswer(value: any, question: any): { valid: boolean; error?: string } {
  if (question.type === "instruction") {
    return { valid: true };
  }
  if (question.required && (!value || value === "")) {
    return { valid: false, error: "This field is required" };
  }
  if (!question.required && (!value || value === "")) {
    return { valid: true };
  }
  switch (question.type) {
    case "email": {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return { valid: false, error: "Please enter a valid email address" };
      break;
    }
    case "phone": {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(value)) return { valid: false, error: "Please enter a valid phone number" };
      break;
    }
    case "yesno":
      if (value !== "yes" && value !== "no" && value !== true && value !== false) {
        return { valid: false, error: "Please select yes or no" };
      }
      break;
    case "multi":
    case "dropdown": {
      const choices = question.choices || [];
      if (choices.length === 0) return { valid: false, error: "No choices configured for this question." };
      const validValues = choices.map((c: any) => c.value);
      if (!validValues.includes(value)) return { valid: false, error: "Please select a valid option" };
      break;
    }
  }
  return { valid: true };
}

export async function POST(request: Request) {
  try {
    const { submissionId, questionId, value } = await request.json();
    if (!submissionId || !questionId) {
      return NextResponse.json({ error: "submissionId and questionId are required" }, { status: 400 });
    }

    const submission = await prisma.qandaSubmission.findUnique({
      where: { id: submissionId },
      include: { form: true },
    });
    if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    if (submission.status !== "in_progress") {
      return NextResponse.json({ error: "Submission is already completed" }, { status: 400 });
    }

    const question = await prisma.qandaQuestion.findUnique({
      where: { id: questionId },
      include: { choices: { orderBy: { order: "asc" } } },
    });
    if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });
    if (question.formId !== submission.formId) {
      return NextResponse.json({ error: "Question does not belong to this form" }, { status: 400 });
    }

    const validation = validateAnswer(value, question);
    if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 });

    if (question.type !== "instruction") {
      const existingAnswer = await prisma.qandaAnswer.findUnique({
        where: { submissionId_questionId: { submissionId, questionId } },
      });

      const answerData: any = { submissionId, questionId };
      if (question.type === "yesno") {
        const boolValue = value === "yes" || value === true;
        answerData.valueJson = boolValue;
        answerData.valueText = boolValue ? "true" : "false";
      } else {
        answerData.valueText = value;
      }

      let answerChanged = false;
      if (!existingAnswer) {
        answerChanged = answerData.valueText !== null && answerData.valueText !== undefined;
      } else if (existingAnswer.valueText !== answerData.valueText) {
        answerChanged = true;
      } else if (existingAnswer.valueJson !== answerData.valueJson) {
        answerChanged = JSON.stringify(existingAnswer.valueJson) !== JSON.stringify(answerData.valueJson);
      }

      if (answerChanged) {
        const currentStep = await prisma.qandaNavStep.findFirst({
          where: { submissionId, questionId },
          orderBy: { stepIndex: "desc" },
        });
        if (currentStep) {
          const deletedSteps = await prisma.qandaNavStep.findMany({
            where: { submissionId, stepIndex: { gt: currentStep.stepIndex } },
          });
          const downstreamQuestionIds = deletedSteps.map((step) => step.questionId);
          if (downstreamQuestionIds.length > 0) {
            await prisma.qandaAnswer.deleteMany({
              where: { submissionId, questionId: { in: downstreamQuestionIds } },
            });
          }
          await prisma.qandaNavStep.deleteMany({
            where: { submissionId, stepIndex: { gt: currentStep.stepIndex } },
          });
        }
      }

      await prisma.qandaAnswer.upsert({
        where: { submissionId_questionId: { submissionId, questionId } },
        create: answerData,
        update: answerData,
      });
    }

    const allAnswers = await prisma.qandaAnswer.findMany({
      where: { submissionId },
      include: { question: { select: { key: true } } },
    });
    const totalQuestions = await prisma.qandaQuestion.count({ where: { formId: submission.formId } });
    const values = answersToValueMap(allAnswers);

    const rules = await prisma.qandaLogicRule.findMany({
      where: { formId: submission.formId, sourceQuestionId: questionId },
      orderBy: { priority: "asc" },
    });

    let answerValue = "";
    let answerValueJson: any = null;
    if (question.type !== "instruction") {
      if (question.type === "yesno") {
        const boolValue = value === "yes" || value === true;
        answerValueJson = boolValue;
        answerValue = boolValue ? "true" : "false";
      } else {
        answerValue = value || "";
      }
    }

    let matchedRule = null as any;
    for (const rule of rules) {
      let matches = false;
      switch (rule.operator) {
        case "equals":
          matches = answerValue === rule.compareValue;
          break;
        case "not_equals":
          matches = answerValue !== rule.compareValue;
          break;
        case "contains":
          matches = answerValue.includes(rule.compareValue || "");
          break;
        case "is_true":
          matches = answerValue === "true" || answerValueJson === true;
          break;
        case "is_false":
          matches = answerValue === "false" || answerValueJson === false;
          break;
        case "any":
          matches = true;
          break;
      }
      if (matches) {
        matchedRule = rule;
        break;
      }
    }

    if (matchedRule) {
      if (matchedRule.destinationQuestionId === questionId) {
        matchedRule = null;
      } else if (matchedRule.isEnd) {
        const currentSubmission = await prisma.qandaSubmission.findUnique({
          where: { id: submissionId },
          select: { status: true },
        });
        if (currentSubmission?.status === "in_progress") {
          await prisma.qandaSubmission.update({
            where: { id: submissionId },
            data: { status: "completed", completedAt: new Date() },
          });
          await fireZapierOnCompletion(submissionId);
        }
        const completedSubmission = await prisma.qandaSubmission.findUnique({
          where: { id: submissionId },
          include: { form: true },
        });
        return NextResponse.json({
          completed: true,
          redirectUrl: completedSubmission?.form.redirectUrl || null,
        });
      } else if (matchedRule.destinationQuestionId) {
        const destinationQuestion = await prisma.qandaQuestion.findUnique({
          where: { id: matchedRule.destinationQuestionId },
          include: { choices: { orderBy: { order: "asc" } } },
        });
        if (destinationQuestion && destinationQuestion.formId === submission.formId) {
          const renderedTitle = renderTemplate(destinationQuestion.title, values);
          const renderedHelpText = renderTemplate(destinationQuestion.helpText, values);
          const maxStep = await prisma.qandaNavStep.findFirst({
            where: { submissionId },
            orderBy: { stepIndex: "desc" },
            select: { stepIndex: true },
          });
          const newStepIndex = (maxStep?.stepIndex ?? -1) + 1;
          await prisma.qandaNavStep.create({
            data: { submissionId, questionId: destinationQuestion.id, stepIndex: newStepIndex },
          });
          return NextResponse.json({
            nextQuestion: {
              id: destinationQuestion.id,
              type: destinationQuestion.type,
              title: destinationQuestion.title,
              helpText: destinationQuestion.helpText,
              renderedTitle,
              renderedHelpText,
              required: destinationQuestion.required,
              key: destinationQuestion.key,
              choices: destinationQuestion.choices.map((c) => ({ value: c.value, label: c.label })),
            },
            stepIndex: newStepIndex,
            totalQuestions,
          });
        }
      }
    }

    const nextQuestion = await prisma.qandaQuestion.findFirst({
      where: { formId: submission.formId, order: { gt: question.order } },
      orderBy: { order: "asc" },
      include: { choices: { orderBy: { order: "asc" } } },
    });

    if (nextQuestion) {
      const renderedTitle = renderTemplate(nextQuestion.title, values);
      const renderedHelpText = renderTemplate(nextQuestion.helpText, values);
      const maxStep = await prisma.qandaNavStep.findFirst({
        where: { submissionId },
        orderBy: { stepIndex: "desc" },
        select: { stepIndex: true },
      });
      const newStepIndex = (maxStep?.stepIndex ?? -1) + 1;
      await prisma.qandaNavStep.create({
        data: { submissionId, questionId: nextQuestion.id, stepIndex: newStepIndex },
      });
      return NextResponse.json({
        nextQuestion: {
          id: nextQuestion.id,
          type: nextQuestion.type,
          title: nextQuestion.title,
          helpText: nextQuestion.helpText,
          renderedTitle,
          renderedHelpText,
          required: nextQuestion.required,
          key: nextQuestion.key,
          choices: nextQuestion.choices.map((c) => ({ value: c.value, label: c.label })),
        },
        stepIndex: newStepIndex,
        totalQuestions,
      });
    }

    const currentSubmission = await prisma.qandaSubmission.findUnique({
      where: { id: submissionId },
      select: { status: true },
    });
    if (currentSubmission?.status === "in_progress") {
      await prisma.qandaSubmission.update({
        where: { id: submissionId },
        data: { status: "completed", completedAt: new Date() },
      });
      await fireZapierOnCompletion(submissionId);
    }
    const completedSubmission = await prisma.qandaSubmission.findUnique({
      where: { id: submissionId },
      include: { form: true },
    });
    return NextResponse.json({
      completed: true,
      redirectUrl: completedSubmission?.form.redirectUrl || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save answer" }, { status: 500 });
  }
}

