-- CreateTable
CREATE TABLE "QandaNavStep" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QandaNavStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QandaNavStep_submissionId_stepIndex_key" ON "QandaNavStep"("submissionId", "stepIndex");

-- CreateIndex
CREATE INDEX "QandaNavStep_submissionId_stepIndex_idx" ON "QandaNavStep"("submissionId", "stepIndex");

-- CreateIndex
CREATE INDEX "QandaNavStep_submissionId_questionId_idx" ON "QandaNavStep"("submissionId", "questionId");

-- AddForeignKey
ALTER TABLE "QandaNavStep" ADD CONSTRAINT "QandaNavStep_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "QandaSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QandaNavStep" ADD CONSTRAINT "QandaNavStep_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QandaQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
