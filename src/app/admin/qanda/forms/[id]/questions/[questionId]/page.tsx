import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card, Input, Select } from "@/components/ui";
import { getQuestion, updateQuestion } from "../actions";
import { ChoiceManager } from "./components/ChoiceManager";
import { DeleteQuestionButton } from "./components/DeleteQuestionButton";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string; questionId: string }>;
}) {
  const { id, questionId } = await params;
  const question = await getQuestion(questionId);

  if (!question) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    try {
      await updateQuestion(questionId, formData);
    } catch (error: any) {
      throw error;
    }
  }

  return (
    <div className="flex max-w-[800px] flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="type-display-md m-0">Edit question</h1>
        <Link href={`/admin/qanda/forms/${id}`} className="type-body-sm ui-text-secondary">
          Back to form
        </Link>
      </div>

      <Card className="p-6">
        <form action={handleUpdate} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="type" className="type-body-sm ui-text-primary">
              Type <span className="text-[var(--danger-fg)]">*</span>
            </label>
            <Select id="type" name="type" defaultValue={question.type} required>
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="yesno">Yes/No</option>
              <option value="multi">Multiple choice</option>
              <option value="dropdown">Dropdown</option>
              <option value="instruction">Instruction</option>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="key" className="type-body-sm ui-text-primary">
              Key <span className="text-[var(--danger-fg)]">*</span>
            </label>
            <Input type="text" id="key" name="key" defaultValue={question.key} required pattern="[a-z0-9_]+" />
            <small className="type-meta-sm ui-text-muted">Lowercase letters, numbers, and underscores only.</small>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="type-body-sm ui-text-primary">
              Title <span className="text-[var(--danger-fg)]">*</span>
            </label>
            <Input type="text" id="title" name="title" defaultValue={question.title} required />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="helpText" className="type-body-sm ui-text-primary">
              Help text (optional)
            </label>
            <textarea id="helpText" name="helpText" rows={3} defaultValue={question.helpText || ""} className="ui-input" />
          </div>

          {question.type !== "instruction" ? (
            <label className="type-body-sm ui-text-primary inline-flex items-center gap-2">
              <input type="checkbox" id="required" name="required" defaultChecked={question.required} />
              Required
            </label>
          ) : (
            <input type="hidden" name="required" value="" />
          )}

          <div className="mt-2 flex gap-3">
            <Button type="submit">Save changes</Button>
            <Link href={`/admin/qanda/forms/${id}`} className="no-underline">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <DeleteQuestionButton questionId={questionId} formId={id} />
          </div>
        </form>
      </Card>

      {(question.type === "multi" || question.type === "dropdown") && (
        <section className="border-t border-[var(--border-subtle)] pt-8">
          <ChoiceManager questionId={questionId} choices={question.choices} />
        </section>
      )}
    </div>
  );
}
