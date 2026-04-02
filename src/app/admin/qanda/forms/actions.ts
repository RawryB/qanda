"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function getPrismaErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }
  return undefined;
}

export async function createForm(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const status = formData.get("status") as string;
  const primaryColor = (formData.get("primaryColor") as string | null) || "#0D0D0D";
  const accentColor = (formData.get("accentColor") as string | null) || "#4A4744";
  const transitionColor = formData.get("transitionColor") as string | null;
  const primaryFont = (formData.get("primaryFont") as string | null) || "Syne";
  const secondaryFont = (formData.get("secondaryFont") as string | null) || "DM Sans";
  const logoUrl = formData.get("logoUrl") as string | null;
  const redirectUrl = formData.get("redirectUrl") as string | null;
  const zapierHookUrl = formData.get("zapierHookUrl") as string | null;
  const backgroundImageUrl = formData.get("backgroundImageUrl") as string | null;
  const introText = formData.get("introText") as string | null;
  const completionTitle = formData.get("completionTitle") as string | null;
  const completionMessage = formData.get("completionMessage") as string | null;
  const showQuestionCountRaw = formData.get("showQuestionCount");
  const showQuestionCount = showQuestionCountRaw === null ? true : String(showQuestionCountRaw) === "true";

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Slug must contain only lowercase letters, numbers, and hyphens");
  }

  const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);
  if (!isHex(primaryColor)) throw new Error("Primary color must be a valid hex code (e.g. #0D0D0D)");
  if (!isHex(accentColor)) throw new Error("Accent color must be a valid hex code (e.g. #4A4744)");
  if (transitionColor && transitionColor.trim() !== "" && !isHex(transitionColor.trim())) {
    throw new Error("Transition color must be a valid hex code (e.g. #1A6BFF)");
  }

  // Validate URLs if provided
  if (redirectUrl && redirectUrl.trim() !== "") {
    try {
      new URL(redirectUrl);
    } catch {
      throw new Error("Invalid redirect URL format");
    }
  }

  if (zapierHookUrl && zapierHookUrl.trim() !== "") {
    try {
      new URL(zapierHookUrl);
    } catch {
      throw new Error("Invalid Zapier hook URL format");
    }
  }

  if (backgroundImageUrl && backgroundImageUrl.trim() !== "") {
    try {
      new URL(backgroundImageUrl);
    } catch {
      throw new Error("Invalid background image URL format");
    }
  }

  if (logoUrl && logoUrl.trim() !== "") {
    try {
      new URL(logoUrl);
    } catch {
      throw new Error("Invalid logo URL format");
    }
    if (!logoUrl.toLowerCase().includes(".png")) {
      throw new Error("Logo must be a PNG URL");
    }
  }

  try {
    const form = await prisma.qandaForm.create({
      data: {
        name,
        slug,
        status: status || "draft",
        primaryColor: primaryColor.trim(),
        accentColor: accentColor.trim(),
        transitionColor: transitionColor?.trim() || null,
        primaryFont: primaryFont.trim() || "Syne",
        secondaryFont: secondaryFont.trim() || "DM Sans",
        logoUrl: logoUrl?.trim() || null,
        redirectUrl: redirectUrl?.trim() || null,
        zapierHookUrl: zapierHookUrl?.trim() || null,
        backgroundImageUrl: backgroundImageUrl?.trim() || null,
        introText: introText?.trim() || null,
        completionTitle: completionTitle?.trim() || null,
        completionMessage: completionMessage?.trim() || null,
        showQuestionCount,
      },
    });

    revalidatePath("/admin/qanda/forms");
    redirect(`/admin/qanda/forms/${form.id}`);
  } catch (error: unknown) {
    if (getPrismaErrorCode(error) === "P2002") {
      throw new Error("A form with this slug already exists");
    }
    throw error;
  }
}

export async function updateForm(id: string, formData: FormData) {
  const existing = await prisma.qandaForm.findUnique({
    where: { id },
  });
  if (!existing) {
    throw new Error("Form not found");
  }

  const getStringOrDefault = (key: string, fallback: string) => {
    const value = formData.get(key);
    if (typeof value !== "string") return fallback;
    return value;
  };

  const getOptionalString = (key: string, fallback: string | null) => {
    const value = formData.get(key);
    if (typeof value !== "string") return fallback;
    return value;
  };

  const getOptionalBoolean = (key: string, fallback: boolean) => {
    const value = formData.get(key);
    if (value === null) return fallback;
    return String(value) === "true";
  };

  const name = getStringOrDefault("name", existing.name);
  const slug = getStringOrDefault("slug", existing.slug);
  const status = getStringOrDefault("status", existing.status);
  const primaryColor = getStringOrDefault("primaryColor", existing.primaryColor || "#0D0D0D");
  const accentColor = getStringOrDefault("accentColor", existing.accentColor || "#4A4744");
  const transitionColor = getOptionalString("transitionColor", existing.transitionColor);
  const primaryFont = getStringOrDefault("primaryFont", existing.primaryFont || "Syne");
  const secondaryFont = getStringOrDefault("secondaryFont", existing.secondaryFont || "DM Sans");
  const logoUrl = getOptionalString("logoUrl", existing.logoUrl);
  const redirectUrl = getOptionalString("redirectUrl", existing.redirectUrl);
  const zapierHookUrl = getOptionalString("zapierHookUrl", existing.zapierHookUrl);
  const backgroundImageUrl = getOptionalString("backgroundImageUrl", existing.backgroundImageUrl);
  const introText = getOptionalString("introText", existing.introText);
  const completionTitle = getOptionalString("completionTitle", existing.completionTitle);
  const completionMessage = getOptionalString("completionMessage", existing.completionMessage);
  const showQuestionCount = getOptionalBoolean("showQuestionCount", existing.showQuestionCount);

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Slug must contain only lowercase letters, numbers, and hyphens");
  }

  const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);
  if (!isHex(primaryColor)) throw new Error("Primary color must be a valid hex code (e.g. #0D0D0D)");
  if (!isHex(accentColor)) throw new Error("Accent color must be a valid hex code (e.g. #4A4744)");
  if (transitionColor && transitionColor.trim() !== "" && !isHex(transitionColor.trim())) {
    throw new Error("Transition color must be a valid hex code (e.g. #1A6BFF)");
  }

  // Validate URLs if provided
  if (redirectUrl && redirectUrl.trim() !== "") {
    try {
      new URL(redirectUrl);
    } catch {
      throw new Error("Invalid redirect URL format");
    }
  }

  if (zapierHookUrl && zapierHookUrl.trim() !== "") {
    try {
      new URL(zapierHookUrl);
    } catch {
      throw new Error("Invalid Zapier hook URL format");
    }
  }

  if (backgroundImageUrl && backgroundImageUrl.trim() !== "") {
    try {
      new URL(backgroundImageUrl);
    } catch {
      throw new Error("Invalid background image URL format");
    }
  }

  if (logoUrl && logoUrl.trim() !== "") {
    try {
      new URL(logoUrl);
    } catch {
      throw new Error("Invalid logo URL format");
    }
    if (!logoUrl.toLowerCase().includes(".png")) {
      throw new Error("Logo must be a PNG URL");
    }
  }

  try {
    await prisma.qandaForm.update({
      where: { id },
      data: {
        name,
        slug,
        status: status || "draft",
        primaryColor: primaryColor.trim(),
        accentColor: accentColor.trim(),
        transitionColor: transitionColor?.trim() || null,
        primaryFont: primaryFont.trim() || "Syne",
        secondaryFont: secondaryFont.trim() || "DM Sans",
        logoUrl: logoUrl?.trim() || null,
        redirectUrl: redirectUrl?.trim() || null,
        zapierHookUrl: zapierHookUrl?.trim() || null,
        backgroundImageUrl: backgroundImageUrl?.trim() || null,
        introText: introText?.trim() || null,
        completionTitle: completionTitle?.trim() || null,
        completionMessage: completionMessage?.trim() || null,
        showQuestionCount,
      },
    });

    revalidatePath("/admin/qanda/forms");
    revalidatePath(`/admin/qanda/forms/${id}`);
  } catch (error: unknown) {
    if (getPrismaErrorCode(error) === "P2002") {
      throw new Error("A form with this slug already exists");
    }
    throw error;
  }
}

export async function deleteForm(id: string) {
  try {
    await prisma.qandaForm.delete({
      where: { id },
    });

    revalidatePath("/admin/qanda/forms");
  } catch (error: unknown) {
    if (getPrismaErrorCode(error) === "P2025") {
      throw new Error("Form not found");
    }
    throw error;
  }
}

export async function getForm(id: string) {
  return await prisma.qandaForm.findUnique({
    where: { id },
  });
}

export async function getForms() {
  const forms = await prisma.qandaForm.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          questions: true,
          submissions: true,
        },
      },
      submissions: {
        select: {
          status: true,
        },
      },
    },
  });

  return forms.map((form) => {
    const completedCount = form.submissions.filter((s) => s.status === "completed").length;
    const completionRate =
      form._count.submissions > 0
        ? Math.round((completedCount / form._count.submissions) * 100)
        : null;

    return {
      ...form,
      questionCount: form._count.questions,
      responseCount: form._count.submissions,
      completionRate,
    };
  });
}
