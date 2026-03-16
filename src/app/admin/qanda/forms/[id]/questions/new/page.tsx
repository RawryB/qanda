import Link from "next/link";
import { redirect } from "next/navigation";
import { createQuestion } from "../actions";
import { QuestionForm } from "./components/QuestionForm";

export default async function NewQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  async function handleCreate(formData: FormData) {
    "use server";
    try {
      const questionId = await createQuestion(id, formData);
      const type = formData.get("type") as string;
      
      // For multi/dropdown, redirect to edit page to add choices
      if (type === "multi" || type === "dropdown") {
        redirect(`/admin/qanda/forms/${id}/questions/${questionId}`);
      } else {
        redirect(`/admin/qanda/forms/${id}`);
      }
    } catch (error: any) {
      throw error;
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        maxWidth: "600px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          New Question
        </h1>
        <Link
          href={`/admin/qanda/forms/${id}`}
          style={{
            color: "#0066cc",
            textDecoration: "underline",
            fontSize: "0.9rem",
          }}
        >
          Back to form
        </Link>
      </div>

      <QuestionForm action={handleCreate} />
    </div>
  );
}
