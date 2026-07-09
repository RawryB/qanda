import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import type { ContentAlignH, ContentAlignV } from "@/lib/forms/runner-alignment";
import { parseContentAlignH, parseContentAlignV } from "@/lib/forms/runner-alignment";

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
  contentAlignH: ContentAlignH;
  contentAlignV: ContentAlignV;
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
  contentAlignH: true,
  contentAlignV: true,
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
    select: publicFormSelect,
  });

  if (!form) {
    return { ok: false, error: "Form not found or not published" };
  }

  return {
    ok: true,
    form: {
      ...form,
      contentAlignH: parseContentAlignH(form.contentAlignH),
      contentAlignV: parseContentAlignV(form.contentAlignV),
    },
  };
}
