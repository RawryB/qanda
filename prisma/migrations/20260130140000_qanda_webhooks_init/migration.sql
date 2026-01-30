-- CreateTable
CREATE TABLE "QandaWebhookAttempt" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL,
    "statusCode" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QandaWebhookAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QandaWebhookAttempt_submissionId_createdAt_idx" ON "QandaWebhookAttempt"("submissionId", "createdAt");

-- CreateIndex
CREATE INDEX "QandaWebhookAttempt_formId_createdAt_idx" ON "QandaWebhookAttempt"("formId", "createdAt");

-- AddForeignKey
ALTER TABLE "QandaWebhookAttempt" ADD CONSTRAINT "QandaWebhookAttempt_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "QandaSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QandaWebhookAttempt" ADD CONSTRAINT "QandaWebhookAttempt_formId_fkey" FOREIGN KEY ("formId") REFERENCES "QandaForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
