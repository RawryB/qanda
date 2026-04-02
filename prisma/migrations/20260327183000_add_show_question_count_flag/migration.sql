-- Add branding toggle for showing x/y question counter in runner
ALTER TABLE "QandaForm"
ADD COLUMN "showQuestionCount" BOOLEAN NOT NULL DEFAULT true;
