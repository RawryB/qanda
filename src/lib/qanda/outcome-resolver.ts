import { prisma } from "@/lib/prisma";

type AnswerValue = string | boolean | number | null;

export type ResolvedOutcome = {
  matched: boolean;
  outcomeRuleId: string | null;
  outcomeRuleName: string | null;
  destinationType: string | null;
  destinationValue: string | null;
  segmentKey: string | null;
};

function normalizeAnswerValue(valueText: string | null, valueJson: unknown): AnswerValue {
  if (valueText !== null && valueText !== undefined && valueText !== "") return valueText;
  if (typeof valueJson === "boolean") return valueJson;
  if (typeof valueJson === "number") return valueJson;
  if (typeof valueJson === "string") return valueJson;
  return null;
}

function parseInValues(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item));
  } catch {
    // Fallback to comma-delimited value list for flexibility.
  }
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function conditionMatches(operator: string, expectedRaw: string, actual: AnswerValue): boolean {
  const actualAsString = actual === null ? "" : String(actual);

  if (operator === "in") {
    const expectedValues = parseInValues(expectedRaw);
    return expectedValues.includes(actualAsString);
  }

  // Default to equals for unknown operators in v1.
  return actualAsString === expectedRaw;
}

function ruleMatches(
  matchType: string,
  conditions: Array<{ operator: string; value: string; questionId: string }>,
  answersByQuestionId: Map<string, AnswerValue>,
): boolean {
  if (conditions.length === 0) return false;

  const results = conditions.map((condition) => {
    const actual = answersByQuestionId.get(condition.questionId) ?? null;
    return conditionMatches(condition.operator, condition.value, actual);
  });

  if (matchType === "any") return results.some(Boolean);
  return results.every(Boolean);
}

export async function resolveSubmissionOutcome(submissionId: string): Promise<ResolvedOutcome> {
  const submission = await prisma.qandaSubmission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      formId: true,
      answers: {
        select: {
          questionId: true,
          valueText: true,
          valueJson: true,
        },
      },
    },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  const answersByQuestionId = new Map<string, AnswerValue>();
  for (const answer of submission.answers) {
    answersByQuestionId.set(
      answer.questionId,
      normalizeAnswerValue(answer.valueText, answer.valueJson),
    );
  }

  const rules = await prisma.qandaOutcomeRule.findMany({
    where: {
      formId: submission.formId,
      isActive: true,
    },
    include: {
      conditions: {
        select: {
          questionId: true,
          operator: true,
          value: true,
        },
      },
    },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  });

  for (const rule of rules) {
    const matched = ruleMatches(rule.matchType, rule.conditions, answersByQuestionId);
    if (!matched) continue;

    return {
      matched: true,
      outcomeRuleId: rule.id,
      outcomeRuleName: rule.name,
      destinationType: rule.destinationType,
      destinationValue: rule.destinationValue,
      segmentKey: rule.segmentKey ?? null,
    };
  }

  return {
    matched: false,
    outcomeRuleId: null,
    outcomeRuleName: null,
    destinationType: null,
    destinationValue: null,
    segmentKey: null,
  };
}

export async function persistResolvedOutcome(
  submissionId: string,
  outcome: ResolvedOutcome,
): Promise<void> {
  await prisma.qandaResolvedOutcome.upsert({
    where: { submissionId },
    create: {
      submissionId,
      outcomeRuleId: outcome.outcomeRuleId,
      destinationType: outcome.destinationType,
      destinationValue: outcome.destinationValue,
      segmentKey: outcome.segmentKey,
      resolvedAt: new Date(),
    },
    update: {
      outcomeRuleId: outcome.outcomeRuleId,
      destinationType: outcome.destinationType,
      destinationValue: outcome.destinationValue,
      segmentKey: outcome.segmentKey,
      resolvedAt: new Date(),
    },
  });
}
