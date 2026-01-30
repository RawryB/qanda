-- CreateTable
CREATE TABLE "QandaLogicRule" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "sourceQuestionId" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "compareValue" TEXT,
    "destinationQuestionId" TEXT,
    "isEnd" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QandaLogicRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QandaLogicRule_formId_sourceQuestionId_priority_idx" ON "QandaLogicRule"("formId", "sourceQuestionId", "priority");

-- AddForeignKey
ALTER TABLE "QandaLogicRule" ADD CONSTRAINT "QandaLogicRule_formId_fkey" FOREIGN KEY ("formId") REFERENCES "QandaForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QandaLogicRule" ADD CONSTRAINT "QandaLogicRule_sourceQuestionId_fkey" FOREIGN KEY ("sourceQuestionId") REFERENCES "QandaQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
