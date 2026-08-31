import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import type { ContentAlignH, ContentAlignV } from "@/lib/forms/runner-alignment";
import { parseContentAlignH, parseContentAlignV } from "@/lib/forms/runner-alignment";
import { toPublicQuestion, type PublicQuestion } from "@/lib/forms/public-question";

export type PublicFormInfo = {
  name: string;
  slug: string;
  introText: string | null;
  completionTitle: string | null;
  completionMessage: string | null;
  primaryColor: string;
  accentColor: string;
  transitionColor: string | null;
  primaryFont: string;
  secondaryFont: string;
  logoUrl: string | null;
  backgroundImageUrl: string | null;
  skipIntro: boolean;
  showQuestionCount: boolean;
  contentAlignH: ContentAlignH;
  contentAlignV: ContentAlignV;
  flushContent: boolean;
  totalQuestions: number;
  firstQuestion: PublicQuestion | null;
};

export type PublicFormInfoResult =
  | { ok: true; form: PublicFormInfo }
  | { ok: false; error: string };

const publicFormSelect = {
  name: true,
  slug: true,
  introText: true,
  completionTitle: true,
  completionMessage: true,
  primaryColor: true,
  accentColor: true,
  transitionColor: true,
  primaryFont: true,
  secondaryFont: true,
  logoUrl: true,
  backgroundImageUrl: true,
  skipIntro: true,
  showQuestionCount: true,
  contentAlignH: true,
  contentAlignV: true,
  flushContent: true,
} as const;

export async function getPublicFormInfo(slug: string, preview = false): Promise<PublicFormInfoResult> {
  if (preview) {
    const { userId } = await auth();
    if (!userId) {
      return { ok: false, error: "Unauthorized preview request" };
    }
  }

  const form = await prisma.qandaForm.findFirst({
    where: {
      slug,
      ...(preview ? {} : { status: "published" }),
    },
    select: {
      ...publicFormSelect,
      questions: {
        orderBy: { order: "asc" },
        include: {
          choices: {
            orderBy: { order: "asc" },
            select: {
              value: true,
              label: true,
            },
          },
        },
      },
    },
  });

  if (!form) {
    return { ok: false, error: "Form not found or not published" };
  }

  const { questions, ...formFields } = form;
  const firstQuestionRecord = questions.find((question) => question.order === 0) || questions[0];
  const firstQuestion = firstQuestionRecord ? toPublicQuestion(firstQuestionRecord) : null;

  return {
    ok: true,
    form: {
      ...formFields,
      contentAlignH: parseContentAlignH(form.contentAlignH),
      contentAlignV: parseContentAlignV(form.contentAlignV),
      totalQuestions: questions.length,
      firstQuestion: form.skipIntro ? firstQuestion : null,
    },
  };
}
