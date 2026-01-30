-- CreateTable
CREATE TABLE "QandaQuestion" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "helpText" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QandaQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QandaChoice" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "QandaChoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QandaQuestion_formId_order_idx" ON "QandaQuestion"("formId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "QandaQuestion_formId_key_key" ON "QandaQuestion"("formId", "key");

-- CreateIndex
CREATE INDEX "QandaChoice_questionId_order_idx" ON "QandaChoice"("questionId", "order");

-- AddForeignKey
ALTER TABLE "QandaQuestion" ADD CONSTRAINT "QandaQuestion_formId_fkey" FOREIGN KEY ("formId") REFERENCES "QandaForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QandaChoice" ADD CONSTRAINT "QandaChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QandaQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
