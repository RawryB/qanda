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

async function getUniqueCopyNameAndSlug(name: string, slug: string) {
  const baseName = `${name} (Copy)`;
  const baseSlug = `${slug}-copy`;

  let attempt = 1;
  while (attempt < 1000) {
    const candidateName = attempt === 1 ? baseName : `${baseName} ${attempt}`;
    const candidateSlug = attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`;
    const existing = await prisma.qandaForm.findFirst({
      where: {
        OR: [{ name: candidateName }, { slug: candidateSlug }],
      },
      select: { id: true },
    });
    if (!existing) return { name: candidateName, slug: candidateSlug };
    attempt += 1;
  }

  throw new Error("Unable to generate a unique name/slug for duplicate form");
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

export async function duplicateForm(id: string) {
  const source = await prisma.qandaForm.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          choices: {
            orderBy: { order: "asc" },
          },
        },
      },
      logicRules: {
        orderBy: { priority: "asc" },
      },
      outcomeRules: {
        orderBy: { priority: "asc" },
        include: {
          conditions: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!source) {
    throw new Error("Form not found");
  }

  const { name, slug } = await getUniqueCopyNameAndSlug(source.name, source.slug);

  const duplicatedFormId = await prisma.$transaction(async (tx) => {
    const duplicated = await tx.qandaForm.create({
      data: {
        name,
        slug,
        status: "draft",
        primaryColor: source.primaryColor,
        accentColor: source.accentColor,
        transitionColor: source.transitionColor,
        primaryFont: source.primaryFont,
        secondaryFont: source.secondaryFont,
        logoUrl: source.logoUrl,
        redirectUrl: source.redirectUrl,
        zapierHookUrl: source.zapierHookUrl,
        backgroundImageUrl: source.backgroundImageUrl,
        introText: source.introText,
        completionTitle: source.completionTitle,
        completionMessage: source.completionMessage,
        showQuestionCount: source.showQuestionCount,
      },
      select: { id: true },
    });

    const questionIdMap = new Map<string, string>();
    for (const q of source.questions) {
      const createdQuestion = await tx.qandaQuestion.create({
        data: {
          formId: duplicated.id,
          order: q.order,
          type: q.type,
          key: q.key,
          title: q.title,
          helpText: q.helpText,
          required: q.required,
        },
        select: { id: true },
      });
      questionIdMap.set(q.id, createdQuestion.id);

      if (q.choices.length > 0) {
        await tx.qandaChoice.createMany({
          data: q.choices.map((c) => ({
            questionId: createdQuestion.id,
            order: c.order,
            value: c.value,
            label: c.label,
          })),
        });
      }
    }

    for (const rule of source.logicRules) {
      const mappedSourceQuestionId = questionIdMap.get(rule.sourceQuestionId);
      if (!mappedSourceQuestionId) continue;
      const mappedDestinationQuestionId = rule.destinationQuestionId
        ? (questionIdMap.get(rule.destinationQuestionId) ?? null)
        : null;

      await tx.qandaLogicRule.create({
        data: {
          formId: duplicated.id,
          sourceQuestionId: mappedSourceQuestionId,
          operator: rule.operator,
          compareValue: rule.compareValue,
          destinationQuestionId: mappedDestinationQuestionId,
          isEnd: rule.isEnd,
          priority: rule.priority,
        },
      });
    }

    for (const outcomeRule of source.outcomeRules) {
      const createdOutcomeRule = await tx.qandaOutcomeRule.create({
        data: {
          formId: duplicated.id,
          name: outcomeRule.name,
          priority: outcomeRule.priority,
          isActive: outcomeRule.isActive,
          matchType: outcomeRule.matchType,
          destinationType: outcomeRule.destinationType,
          destinationValue: outcomeRule.destinationValue,
          segmentKey: outcomeRule.segmentKey,
        },
        select: { id: true },
      });

      const mappedConditions = outcomeRule.conditions
        .map((condition) => {
          const mappedQuestionId = questionIdMap.get(condition.questionId);
          if (!mappedQuestionId) return null;
          return {
            outcomeRuleId: createdOutcomeRule.id,
            questionId: mappedQuestionId,
            operator: condition.operator,
            value: condition.value,
          };
        })
        .filter((condition): condition is NonNullable<typeof condition> => condition !== null);

      if (mappedConditions.length > 0) {
        await tx.qandaOutcomeCondition.createMany({
          data: mappedConditions,
        });
      }
    }

    return duplicated.id;
  });

  revalidatePath("/admin/qanda/forms");
  return duplicatedFormId;
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
