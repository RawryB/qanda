"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { duplicateForm } from "../actions";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function DuplicateFormButton({ formId, formName }: { formId: string; formName: string }) {
  const [isDuplicating, setIsDuplicating] = useState(false);
  const router = useRouter();

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      const duplicatedFormId = await duplicateForm(formId);
      router.push(`/admin/qanda/forms/${duplicatedFormId}`);
      router.refresh();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to duplicate form"));
      setIsDuplicating(false);
    }
  };

  return (
    <Button
      onClick={handleDuplicate}
      variant="ghost"
      size="sm"
      className="px-2"
      disabled={isDuplicating}
      title={`Duplicate ${formName}`}
    >
      {isDuplicating ? "…" : "⧉"}
    </Button>
  );
}
