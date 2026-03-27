import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { renderTemplate } from "@/lib/qanda/template";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function POST(request: Request) {
  try {
    const { slug, preview } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    if (preview) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized preview request" }, { status: 401 });
      }
    }

    const form = await prisma.qandaForm.findFirst({
      where: {
        slug,
        ...(preview ? {} : { status: "published" }),
      },
      include: {
        questions: {
          include: {
            choices: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found or not published" }, { status: 404 });
    }

    if (form.questions.length === 0) {
      return NextResponse.json({ error: "Form has no questions" }, { status: 400 });
    }

    const totalQuestions = form.questions.length;

    const submission = await prisma.qandaSubmission.create({
      data: {
        formId: form.id,
        status: "in_progress",
      },
    });

    const firstQuestion = form.questions.find((q) => q.order === 0) || form.questions[0];

    await prisma.qandaNavStep.create({
      data: {
        submissionId: submission.id,
        questionId: firstQuestion.id,
        stepIndex: 0,
      },
    });

    const values: Record<string, string> = {};
    const renderedTitle = renderTemplate(firstQuestion.title, values);
    const renderedHelpText = renderTemplate(firstQuestion.helpText, values);

    return NextResponse.json({
      submissionId: submission.id,
      question: {
        id: firstQuestion.id,
        type: firstQuestion.type,
        title: firstQuestion.title,
        helpText: firstQuestion.helpText,
        renderedTitle,
        renderedHelpText,
        required: firstQuestion.required,
        key: firstQuestion.key,
        choices: firstQuestion.choices.map((c) => ({
          value: c.value,
          label: c.label,
        })),
      },
      stepIndex: 0,
      totalQuestions,
      form: {
        name: form.name,
        slug: form.slug,
        backgroundImageUrl: form.backgroundImageUrl,
        introText: form.introText,
        completionTitle: form.completionTitle,
        completionMessage: form.completionMessage,
        primaryColor: form.primaryColor,
        accentColor: form.accentColor,
        transitionColor: form.transitionColor,
        primaryFont: form.primaryFont,
        secondaryFont: form.secondaryFont,
        logoUrl: form.logoUrl,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Failed to start form") }, { status: 500 });
  }
}

