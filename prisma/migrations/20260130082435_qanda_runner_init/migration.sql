-- CreateTable
CREATE TABLE "QandaSubmission" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "QandaSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QandaAnswer" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "valueText" TEXT,
    "valueJson" JSONB,

    CONSTRAINT "QandaAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QandaSubmission_formId_startedAt_idx" ON "QandaSubmission"("formId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "QandaAnswer_submissionId_questionId_key" ON "QandaAnswer"("submissionId", "questionId");

-- AddForeignKey
ALTER TABLE "QandaSubmission" ADD CONSTRAINT "QandaSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "QandaForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QandaAnswer" ADD CONSTRAINT "QandaAnswer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "QandaSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QandaAnswer" ADD CONSTRAINT "QandaAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QandaQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
