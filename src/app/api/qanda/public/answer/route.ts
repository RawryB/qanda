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

    // Store answer (normalize for yesno: store both valueJson and valueText)
    const answerData: any = {
      submissionId,
      questionId,
    };

    if (question.type === "yesno") {
      const boolValue = value === "yes" || value === true;
      answerData.valueJson = boolValue;
      answerData.valueText = boolValue ? "true" : "false"; // Store as string for consistent evaluation
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

    // Evaluate branching rules
    // 
    // Example scenario:
    // - Form has questions: Q1 (yesno: "Are you a member?"), Q2 (text: "Name"), Q3 (text: "Email")
    // - Rule 1 (priority 0): When Q1 = "yes" → Go to Q3 (skip Q2)
    // - Rule 2 (priority 1): When Q1 = "no" → Go to Q2 (default flow)
    // 
    // Flow:
    // 1. User answers Q1 with "yes"
    // 2. Rules are evaluated in priority order (0, then 1)
    // 3. Rule 1 matches → User goes directly to Q3, skipping Q2
    // 4. If user answers "no", Rule 1 doesn't match, Rule 2 matches → User goes to Q2
    // 5. If no rules match, default to next question in order
    //
    // Load all rules for this question, ordered by priority (lower = first)
    const rules = await prisma.qandaLogicRule.findMany({
      where: {
        formId: submission.formId,
        sourceQuestionId: questionId,
      },
      orderBy: {
        priority: "asc",
      },
    });

    // Normalize answer value for rule evaluation
    let answerValue: string;
    if (question.type === "yesno") {
      // For yesno, use valueText ("true"/"false") or convert boolean
      answerValue = answerData.valueText || (answerData.valueJson ? "true" : "false");
    } else {
      // For other types, use valueText (string)
      answerValue = answerData.valueText || "";
    }

    // Evaluate rules in priority order (first match wins)
    let matchedRule = null;
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
          // For yesno questions, check if value is true
          matches = answerValue === "true" || answerData.valueJson === true;
          break;
        case "is_false":
          // For yesno questions, check if value is false
          matches = answerValue === "false" || answerData.valueJson === false;
          break;
      }

      if (matches) {
        matchedRule = rule;
        break; // First match wins
      }
    }

    // If a rule matched, follow its destination
    if (matchedRule) {
      // Guardrail: Prevent infinite loops (destination equals current question)
      if (matchedRule.destinationQuestionId === questionId) {
        // Ignore rule, fall through to default behavior
        matchedRule = null;
      } else if (matchedRule.isEnd) {
        // End the form
        await prisma.qandaSubmission.update({
          where: { id: submissionId },
          data: {
            status: "completed",
            completedAt: new Date(),
          },
        });
        // Reload submission to get form with redirectUrl
        const completedSubmission = await prisma.qandaSubmission.findUnique({
          where: { id: submissionId },
          include: { form: true },
        });
        return NextResponse.json({
          completed: true,
          redirectUrl: completedSubmission?.form.redirectUrl || null,
        });
      } else if (matchedRule.destinationQuestionId) {
        // Go to destination question
        const destinationQuestion = await prisma.qandaQuestion.findUnique({
          where: { id: matchedRule.destinationQuestionId },
          include: {
            choices: {
              orderBy: { order: "asc" },
            },
          },
        });

        // Guardrail: If destination question is missing (deleted), ignore rule
        if (!destinationQuestion) {
          // Fall through to default behavior
          matchedRule = null;
        } else {
          // Verify destination question belongs to the form
          if (destinationQuestion.formId !== submission.formId) {
            // Fall through to default behavior
            matchedRule = null;
          } else {
            return NextResponse.json({
              nextQuestion: {
                id: destinationQuestion.id,
                type: destinationQuestion.type,
                title: destinationQuestion.title,
                helpText: destinationQuestion.helpText,
                required: destinationQuestion.required,
                key: destinationQuestion.key,
                choices: destinationQuestion.choices.map((c) => ({
                  value: c.value,
                  label: c.label,
                })),
              },
            });
          }
        }
      }
    }

    // Default behavior: Find next question in order (linear flow)
    // This happens if no rule matched, or if matched rule was invalid
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
      // No more questions, complete the submission
      await prisma.qandaSubmission.update({
        where: { id: submissionId },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      });
      // Reload submission to get form with redirectUrl
      const completedSubmission = await prisma.qandaSubmission.findUnique({
        where: { id: submissionId },
        include: { form: true },
      });
      return NextResponse.json({
        completed: true,
        redirectUrl: completedSubmission?.form.redirectUrl || null,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save answer" }, { status: 500 });
  }
}
