import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { fireZapierOnCompletion } from "@/lib/qanda/webhook";

export async function POST(request: Request) {
  try {
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
    }

    // Load submission and verify it's in progress
    const submission = await prisma.qandaSubmission.findUnique({
      where: { id: submissionId },
      include: {
        form: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.status !== "in_progress") {
      return NextResponse.json({ error: "Submission is already completed" }, { status: 400 });
    }

    // Mark as completed
    await prisma.qandaSubmission.update({
      where: { id: submissionId },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    });

    // Fire webhook (best-effort, don't await to block response)
    fireZapierOnCompletion(submissionId).catch((err) => {
      console.error("Webhook error (non-blocking):", err);
    });

    // Return redirect URL (do not expose zapierHookUrl)
    return NextResponse.json({
      redirectUrl: submission.form.redirectUrl || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to complete submission" }, { status: 500 });
  }
}
