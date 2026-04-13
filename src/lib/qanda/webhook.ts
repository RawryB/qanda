import { prisma } from "@/lib/prisma";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function getAnswerValue(answer: { valueText: string | null; valueJson: unknown }) {
  if (answer.valueText !== null && answer.valueText !== undefined) {
    return answer.valueText;
  }
  if (answer.valueJson !== null && answer.valueJson !== undefined) {
    if (typeof answer.valueJson === "boolean") return answer.valueJson;
    if (typeof answer.valueJson === "string" || typeof answer.valueJson === "number") {
      return answer.valueJson;
    }
  }
  return null;
}

function getSchemaSampleValue(type: string) {
  switch (type) {
    case "yesno":
      return false;
    case "multi":
    case "dropdown":
      return "";
    case "instruction":
      return null;
    default:
      return "";
  }
}

function toSafeFieldKey(key: string) {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Fires a webhook to Zapier when a submission is completed.
 * Best-effort: does not throw errors that would break the caller.
 */
export async function fireZapierOnCompletion(submissionId: string): Promise<void> {
  try {
    // Load submission with form and answers
    const submission = await prisma.qandaSubmission.findUnique({
      where: { id: submissionId },
      include: {
        form: {
          select: {
            id: true,
            slug: true,
            name: true,
            zapierHookUrl: true,
            questions: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                key: true,
                title: true,
                type: true,
              },
            },
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                key: true,
                title: true,
                type: true,
              },
            },
          },
        },
        resolvedOutcome: {
          include: {
            outcomeRule: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      // Submission not found, silently return
      return;
    }

    // If no zapierHookUrl, return silently
    if (!submission.form.zapierHookUrl) {
      return;
    }

    const zapierHookUrl = submission.form.zapierHookUrl;

    // Build payload
    const values: Record<string, string | number | boolean | null> = {};
    for (const question of submission.form.questions) {
      values[question.key] = null;
    }
    const answers = submission.answers.map((answer) => {
      const value = getAnswerValue(answer);

      // Add to values map for convenience
      if (value !== null) {
        values[answer.question.key] = value;
      }

      return {
        questionId: answer.question.id,
        key: answer.question.key,
        title: answer.question.title,
        type: answer.question.type,
        value,
      };
    });

    const payload = {
      event: "qanda.submission.completed",
      submissionId: submission.id,
      form: {
        id: submission.form.id,
        slug: submission.form.slug,
        name: submission.form.name,
      },
      completedAt: submission.completedAt?.toISOString() || null,
      resolvedOutcome: submission.resolvedOutcome
        ? {
            matched: Boolean(submission.resolvedOutcome.outcomeRuleId),
            outcomeRuleId: submission.resolvedOutcome.outcomeRuleId,
            outcomeRuleName: submission.resolvedOutcome.outcomeRule?.name || null,
            destinationType: submission.resolvedOutcome.destinationType,
            destinationValue: submission.resolvedOutcome.destinationValue,
            segmentKey: submission.resolvedOutcome.segmentKey,
            resolvedAt: submission.resolvedOutcome.resolvedAt.toISOString(),
          }
        : null,
      answers,
      values,
    };

    // Retry logic: up to 3 attempts with backoff
    const maxAttempts = 3;
    const backoffDelays = [0, 500, 1500]; // ms
    const timeoutMs = 20000; // 20 seconds (Zapier can be slow in production)

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Wait for backoff delay (except first attempt)
        if (attempt > 1) {
          await new Promise((resolve) => setTimeout(resolve, backoffDelays[attempt - 1]));
        }

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const response = await fetch(zapierHookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          // Log attempt
          await prisma.qandaWebhookAttempt.create({
            data: {
              submissionId: submission.id,
              formId: submission.formId,
              url: zapierHookUrl,
              attempt,
              statusCode: response.status,
              success: response.status >= 200 && response.status < 300,
              error: response.status >= 300 ? `HTTP ${response.status}` : null,
            },
          });

          // Success (2xx)
          if (response.status >= 200 && response.status < 300) {
            return; // Success, exit function
          }
        } catch (fetchError: unknown) {
          clearTimeout(timeoutId);

          // Handle abort (timeout)
          if (fetchError instanceof Error && fetchError.name === "AbortError") {
            lastError = new Error(`Request timeout after ${Math.round(timeoutMs / 1000)} seconds`);
          } else {
            lastError = new Error(getErrorMessage(fetchError, "Unknown error"));
          }

          // Log attempt with error
          await prisma.qandaWebhookAttempt.create({
            data: {
              submissionId: submission.id,
              formId: submission.formId,
              url: zapierHookUrl,
              attempt,
              statusCode: null,
              success: false,
              error: lastError ? lastError.message : "Unknown error",
            },
          });
        }
      } catch (logError: unknown) {
        // If logging fails, continue to next attempt
        console.error("Failed to log webhook attempt:", logError);
      }
    }

    // All attempts failed, but don't throw - best effort
    console.error(
      `Webhook failed after ${maxAttempts} attempts for submission ${submissionId}`,
      lastError
    );
  } catch (error: unknown) {
    // Catch-all: don't throw errors that would break the caller
    console.error("Error in fireZapierOnCompletion:", error);
  }
}

export async function fireZapierSchemaTestForForm(
  formId: string,
): Promise<{ sent: boolean; reason?: string }> {
  try {
    const form = await prisma.qandaForm.findUnique({
      where: { id: formId },
      include: {
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

    if (!form) return { sent: false, reason: "Form not found" };
    if (!form.zapierHookUrl) return { sent: false, reason: "Zapier hook URL is not configured" };

    const values: Record<string, string | number | boolean | null> = {};
    const flatValues: Record<string, string | number | boolean | null> = {};
    const fieldLabels: Record<string, string> = {};
    const fieldTypes: Record<string, string> = {};
    const fieldOptions: Record<string, string> = {};
    const schema = form.questions.map((question) => {
      const sampleValue = getSchemaSampleValue(question.type);
      values[question.key] = sampleValue;
      const safeKey = toSafeFieldKey(question.key);
      const flatValueKey = `answer_${safeKey}`;
      const flatLabelKey = `label_${safeKey}`;
      const flatTypeKey = `type_${safeKey}`;
      const flatOptionsKey = `options_${safeKey}`;

      flatValues[flatValueKey] = sampleValue;
      fieldLabels[flatLabelKey] = question.title;
      fieldTypes[flatTypeKey] = question.type;
      fieldOptions[flatOptionsKey] = question.choices.map((choice) => choice.label).join(" | ");

      return {
        questionId: question.id,
        key: question.key,
        title: question.title,
        type: question.type,
        choices: question.choices.map((choice) => ({
          value: choice.value,
          label: choice.label,
        })),
        sampleValue,
      };
    });

    const payload = {
      event: "qanda.form.schema",
      form: {
        id: form.id,
        slug: form.slug,
        name: form.name,
      },
      generatedAt: new Date().toISOString(),
      // Zapier-friendly flat keys for easier field mapping.
      ...flatValues,
      ...fieldLabels,
      ...fieldTypes,
      ...fieldOptions,
      questionCount: form.questions.length,
      schema,
      values,
    };

    const response = await fetch(form.zapierHookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status >= 200 && response.status < 300) {
      return { sent: true };
    }

    return { sent: false, reason: `Zapier returned HTTP ${response.status}` };
  } catch (error: unknown) {
    return {
      sent: false,
      reason: getErrorMessage(error, "Failed to send Zapier schema payload"),
    };
  }
}
