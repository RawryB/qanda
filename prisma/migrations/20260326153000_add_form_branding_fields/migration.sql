-- Add branding fields to forms
ALTER TABLE "QandaForm"
ADD COLUMN "primaryColor" TEXT NOT NULL DEFAULT '#0D0D0D',
ADD COLUMN "accentColor" TEXT NOT NULL DEFAULT '#4A4744',
ADD COLUMN "transitionColor" TEXT,
ADD COLUMN "primaryFont" TEXT NOT NULL DEFAULT 'Syne',
ADD COLUMN "secondaryFont" TEXT NOT NULL DEFAULT 'DM Sans',
ADD COLUMN "logoUrl" TEXT;

-- Align QandaChoice uniqueness with current Prisma schema
ALTER TABLE "QandaChoice"
ADD CONSTRAINT "QandaChoice_questionId_value_key" UNIQUE ("questionId", "value");
