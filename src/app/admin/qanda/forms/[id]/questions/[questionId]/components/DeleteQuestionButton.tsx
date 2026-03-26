"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { deleteQuestion } from "../../actions";

export function DeleteQuestionButton({
  questionId,
  formId,
}: {
  questionId: string;
  formId: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestion(questionId);
      router.push(`/admin/qanda/forms/${formId}`);
    } catch (error: any) {
      alert(error.message || "Failed to delete question");
    }
  }

  return (
    <Button variant="ghost" onClick={handleDelete} className="border-[var(--danger-fg)] text-[var(--danger-fg)]">
      Delete
    </Button>
  );
}
