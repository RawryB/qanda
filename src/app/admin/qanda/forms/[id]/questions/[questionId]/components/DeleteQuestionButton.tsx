"use client";

import { useRouter } from "next/navigation";
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
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      await deleteQuestion(questionId);
      router.push(`/admin/qanda/forms/${formId}`);
    } catch (error: any) {
      alert(error.message || "Failed to delete question");
    }
  }

  return (
    <button
      onClick={handleDelete}
      style={{
        padding: "0.75rem 1.5rem",
        backgroundColor: "#dc2626",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        fontSize: "1rem",
        fontWeight: "500",
        cursor: "pointer",
      }}
    >
      Delete
    </button>
  );
}
