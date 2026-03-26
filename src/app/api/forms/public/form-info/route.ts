import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const form = await prisma.qandaForm.findFirst({
      where: {
        slug,
        status: "published",
      },
      select: {
        name: true,
        slug: true,
        introText: true,
        completionTitle: true,
        completionMessage: true,
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
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch form" }, { status: 500 });
  }
}

