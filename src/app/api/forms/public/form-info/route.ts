import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const preview = searchParams.get("preview") === "1";

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
      select: {
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
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found or not published" }, { status: 404 });
    }

    return NextResponse.json({
      name: form.name,
      slug: form.slug,
      introText: form.introText,
      completionTitle: form.completionTitle,
      completionMessage: form.completionMessage,
      primaryColor: form.primaryColor,
      accentColor: form.accentColor,
      transitionColor: form.transitionColor,
      primaryFont: form.primaryFont,
      secondaryFont: form.secondaryFont,
      logoUrl: form.logoUrl,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Failed to fetch form") }, { status: 500 });
  }
}

