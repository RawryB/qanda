-- Smart routing / outcomes models
CREATE TABLE "QandaOutcomeRule" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "matchType" TEXT NOT NULL DEFAULT 'all',
    "destinationType" TEXT NOT NULL DEFAULT 'redirect_url',
    "destinationValue" TEXT NOT NULL,
    "segmentKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QandaOutcomeRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QandaOutcomeCondition" (
    "id" TEXT NOT NULL,
    "outcomeRuleId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "operator" TEXT NOT NULL DEFAULT 'equals',
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QandaOutcomeCondition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QandaResolvedOutcome" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "outcomeRuleId" TEXT,
    "destinationType" TEXT,
    "destinationValue" TEXT,
    "segmentKey" TEXT,
    "resolvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QandaResolvedOutcome_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "QandaResolvedOutcome_submissionId_key" ON "QandaResolvedOutcome"("submissionId");
CREATE INDEX "QandaOutcomeRule_formId_isActive_priority_idx" ON "QandaOutcomeRule"("formId", "isActive", "priority");
CREATE INDEX "QandaOutcomeCondition_outcomeRuleId_idx" ON "QandaOutcomeCondition"("outcomeRuleId");
CREATE INDEX "QandaOutcomeCondition_questionId_idx" ON "QandaOutcomeCondition"("questionId");
CREATE INDEX "QandaResolvedOutcome_outcomeRuleId_idx" ON "QandaResolvedOutcome"("outcomeRuleId");

ALTER TABLE "QandaOutcomeRule"
ADD CONSTRAINT "QandaOutcomeRule_formId_fkey"
FOREIGN KEY ("formId") REFERENCES "QandaForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QandaOutcomeCondition"
ADD CONSTRAINT "QandaOutcomeCondition_outcomeRuleId_fkey"
FOREIGN KEY ("outcomeRuleId") REFERENCES "QandaOutcomeRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QandaOutcomeCondition"
ADD CONSTRAINT "QandaOutcomeCondition_questionId_fkey"
FOREIGN KEY ("questionId") REFERENCES "QandaQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QandaResolvedOutcome"
ADD CONSTRAINT "QandaResolvedOutcome_submissionId_fkey"
FOREIGN KEY ("submissionId") REFERENCES "QandaSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QandaResolvedOutcome"
ADD CONSTRAINT "QandaResolvedOutcome_outcomeRuleId_fkey"
FOREIGN KEY ("outcomeRuleId") REFERENCES "QandaOutcomeRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
