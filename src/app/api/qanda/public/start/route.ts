import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { renderTemplate } from "@/lib/qanda/template";

export async function POST(request: Request) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Find published form by slug
    const form = await prisma.qandaForm.findFirst({
      where: {
        slug,
        status: "published",
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

    // Get total question count
    const totalQuestions = form.questions.length;

    // Create submission
    const submission = await prisma.qandaSubmission.create({
      data: {
        formId: form.id,
        status: "in_progress",
      },
    });

    const firstQuestion = form.questions.find(q => q.order === 0) || form.questions[0];

    // Create first nav step with stepIndex=0
    await prisma.qandaNavStep.create({
      data: {
        submissionId: submission.id,
        questionId: firstQuestion.id,
        stepIndex: 0,
      },
    });

    // For /start: there are no prior answers, so values map is empty
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
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to start form" }, { status: 500 });
  }
}
