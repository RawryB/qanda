import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
          where: {
            order: 0, // First question
          },
          include: {
            choices: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found or not published" }, { status: 404 });
    }

    if (form.questions.length === 0) {
      return NextResponse.json({ error: "Form has no questions" }, { status: 400 });
    }

    // Create submission
    const submission = await prisma.qandaSubmission.create({
      data: {
        formId: form.id,
        status: "in_progress",
      },
    });

    const firstQuestion = form.questions[0];

    return NextResponse.json({
      submissionId: submission.id,
      question: {
        id: firstQuestion.id,
        type: firstQuestion.type,
        title: firstQuestion.title,
        helpText: firstQuestion.helpText,
        required: firstQuestion.required,
        key: firstQuestion.key,
        choices: firstQuestion.choices.map((c) => ({
          value: c.value,
          label: c.label,
        })),
      },
      form: {
        name: form.name,
        slug: form.slug,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to start form" }, { status: 500 });
  }
}
