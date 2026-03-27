import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { fireZapierOnCompletion } from "@/lib/qanda/webhook";
import {
  persistResolvedOutcome,
  resolveSubmissionOutcome,
} from "@/lib/qanda/outcome-resolver";

export async function POST(request: Request) {
  try {
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
    }

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

    await prisma.qandaSubmission.update({
      where: { id: submissionId },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    });

    await fireZapierOnCompletion(submissionId);
    const outcome = await resolveSubmissionOutcome(submissionId);
    await persistResolvedOutcome(submissionId, outcome);

    const matchedRedirect =
      outcome.matched && outcome.destinationType === "redirect_url"
        ? outcome.destinationValue
        : null;

    return NextResponse.json({
      redirectUrl: matchedRedirect || submission.form.redirectUrl || null,
      routing: {
        matched: outcome.matched,
        outcomeRuleId: outcome.outcomeRuleId,
        outcomeRuleName: outcome.outcomeRuleName,
        destinationType: outcome.destinationType,
        destinationValue: outcome.destinationValue,
        segmentKey: outcome.segmentKey,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to complete submission" }, { status: 500 });
  }
}

