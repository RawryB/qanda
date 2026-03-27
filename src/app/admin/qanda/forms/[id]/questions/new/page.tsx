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
    const questionId = await createQuestion(id, formData);
    const type = formData.get("type") as string;

    if (type === "multi" || type === "dropdown") {
      redirect(`/admin/qanda/forms/${id}/questions/${questionId}`);
    } else {
      redirect(`/admin/qanda/forms/${id}`);
    }
  }

  return (
    <div className="flex max-w-[700px] flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="type-display-md m-0">New question</h1>
        <Link href={`/admin/qanda/forms/${id}`} className="type-body-sm ui-text-secondary">
          Back to form
        </Link>
      </div>

      <QuestionForm action={handleCreate} />
    </div>
  );
}
