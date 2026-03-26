"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createForm(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const status = formData.get("status") as string;
  const redirectUrl = formData.get("redirectUrl") as string | null;
  const zapierHookUrl = formData.get("zapierHookUrl") as string | null;
  const backgroundImageUrl = formData.get("backgroundImageUrl") as string | null;
  const introText = formData.get("introText") as string | null;
  const completionTitle = formData.get("completionTitle") as string | null;
  const completionMessage = formData.get("completionMessage") as string | null;

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Slug must contain only lowercase letters, numbers, and hyphens");
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

  try {
    const form = await prisma.qandaForm.create({
      data: {
        name,
        slug,
        status: status || "draft",
        redirectUrl: redirectUrl?.trim() || null,
        zapierHookUrl: zapierHookUrl?.trim() || null,
        backgroundImageUrl: backgroundImageUrl?.trim() || null,
        introText: introText?.trim() || null,
        completionTitle: completionTitle?.trim() || null,
        completionMessage: completionMessage?.trim() || null,
      },
    });

    revalidatePath("/admin/qanda/forms");
    redirect(`/admin/qanda/forms/${form.id}`);
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("A form with this slug already exists");
    }
    throw error;
  }
}

export async function updateForm(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const status = formData.get("status") as string;
  const redirectUrl = formData.get("redirectUrl") as string | null;
  const zapierHookUrl = formData.get("zapierHookUrl") as string | null;
  const backgroundImageUrl = formData.get("backgroundImageUrl") as string | null;
  const introText = formData.get("introText") as string | null;
  const completionTitle = formData.get("completionTitle") as string | null;
  const completionMessage = formData.get("completionMessage") as string | null;

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Slug must contain only lowercase letters, numbers, and hyphens");
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

  try {
    await prisma.qandaForm.update({
      where: { id },
      data: {
        name,
        slug,
        status: status || "draft",
        redirectUrl: redirectUrl?.trim() || null,
        zapierHookUrl: zapierHookUrl?.trim() || null,
        backgroundImageUrl: backgroundImageUrl?.trim() || null,
        introText: introText?.trim() || null,
        completionTitle: completionTitle?.trim() || null,
        completionMessage: completionMessage?.trim() || null,
      },
    });

    revalidatePath("/admin/qanda/forms");
    revalidatePath(`/admin/qanda/forms/${id}`);
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("A form with this slug already exists");
    }
    if (error.code === "P2025") {
      throw new Error("Form not found");
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
  } catch (error: any) {
    if (error.code === "P2025") {
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
