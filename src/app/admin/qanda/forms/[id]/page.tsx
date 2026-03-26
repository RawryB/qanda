import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button, Card, Input, Select } from "@/components/ui";
import { getForm, updateForm } from "../actions";
import { getQuestions } from "./questions/actions";
import { DeleteQuestionButton, MoveQuestionButton } from "./questions/components/QuestionActions";

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const form = await getForm(id);

  if (!form) {
    notFound();
  }

  const questions = await getQuestions(id);

  async function handleUpdate(formData: FormData) {
    "use server";
    try {
      await updateForm(id, formData);
    } catch (error: any) {
      throw error;
    }
  }

  return (
    <div className="flex max-w-[900px] flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="type-display-md m-0">Edit form</h1>
        <div className="flex items-center gap-2">
          <Link href={`/admin/qanda/forms/${id}/rules`} className="no-underline">
            <Button variant="ghost">Branching rules</Button>
          </Link>
          <Link href={`/admin/qanda/submissions?formId=${id}`} className="no-underline">
            <Button variant="ghost">View submissions</Button>
          </Link>
          <Link href="/admin/qanda/forms" className="type-body-sm ui-text-secondary">
            Back to forms
          </Link>
        </div>
      </div>

      <Card className="p-6">
        <form action={handleUpdate} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="type-body-sm ui-text-primary">
              Name <span className="text-[var(--danger-fg)]">*</span>
            </label>
            <Input type="text" id="name" name="name" defaultValue={form.name} required />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="slug" className="type-body-sm ui-text-primary">
              Slug <span className="text-[var(--danger-fg)]">*</span>
            </label>
            <Input type="text" id="slug" name="slug" defaultValue={form.slug} required pattern="[a-z0-9-]+" />
            <small className="type-meta-sm ui-text-muted">
              Lowercase letters, numbers, and hyphens only. No spaces.
            </small>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="status" className="type-body-sm ui-text-primary">
              Status
            </label>
            <Select id="status" name="status" defaultValue={form.status}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="redirectUrl" className="type-body-sm ui-text-primary">
              Redirect URL (optional)
            </label>
            <Input type="url" id="redirectUrl" name="redirectUrl" defaultValue={form.redirectUrl || ""} />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="zapierHookUrl" className="type-body-sm ui-text-primary">
              Zapier Hook URL (optional)
            </label>
            <Input type="url" id="zapierHookUrl" name="zapierHookUrl" defaultValue={form.zapierHookUrl || ""} />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="backgroundImageUrl" className="type-body-sm ui-text-primary">
              Background Image URL (optional)
            </label>
            <Input
              type="url"
              id="backgroundImageUrl"
              name="backgroundImageUrl"
              defaultValue={form.backgroundImageUrl || ""}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="introText" className="type-body-sm ui-text-primary">
              Intro Text (optional)
            </label>
            <textarea
              id="introText"
              name="introText"
              defaultValue={form.introText || ""}
              rows={4}
              className="ui-input min-h-[96px]"
            />
            <small className="type-meta-sm ui-text-muted">
              Shown on the first screen before the applicant starts the form.
            </small>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="completionTitle" className="type-body-sm ui-text-primary">
              Completion Title (optional)
            </label>
            <Input
              type="text"
              id="completionTitle"
              name="completionTitle"
              defaultValue={form.completionTitle || ""}
              placeholder="Done"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="completionMessage" className="type-body-sm ui-text-primary">
              Completion Message (optional)
            </label>
            <textarea
              id="completionMessage"
              name="completionMessage"
              defaultValue={form.completionMessage || ""}
              rows={3}
              placeholder="Thank you for your submission!"
              className="ui-input min-h-[84px]"
            />
          </div>

          <div className="mt-2 flex gap-3">
            <Button type="submit">Save changes</Button>
            <Link href="/admin/qanda/forms" className="no-underline">
              <Button variant="ghost">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>

      <section className="mt-2 border-t border-[var(--border-subtle)] pt-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="type-heading-lg m-0">Questions</h2>
          <Link href={`/admin/qanda/forms/${id}/questions/new`} className="no-underline">
            <Button>Add question</Button>
          </Link>
        </div>

        {questions.length === 0 ? (
          <p className="type-body-md ui-text-secondary">No questions yet. Add your first question to get started.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {questions.map((question) => (
              <Card key={question.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-2">
                  <span className="type-meta-sm ui-text-secondary">#{question.order + 1}</span>
                  <Link
                    href={`/admin/qanda/forms/${id}/questions/${question.id}`}
                    className="type-heading-md ui-text-primary flex-1 no-underline hover:underline"
                  >
                    {question.title}
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <Badge>{question.type}</Badge>
                  {question.required && (
                    <span className="inline-flex items-center rounded-[999px] bg-[var(--danger-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--danger-fg)]">
                      Required
                    </span>
                  )}
                  <div className="ml-auto flex gap-2">
                    <MoveQuestionButton
                      formId={id}
                      questionId={question.id}
                      direction="up"
                      disabled={question.order === 0}
                    />
                    <MoveQuestionButton
                      formId={id}
                      questionId={question.id}
                      direction="down"
                      disabled={question.order === questions.length - 1}
                    />
                    <Link href={`/admin/qanda/forms/${id}/questions/${question.id}`} className="no-underline">
                      <Button variant="ghost">Edit</Button>
                    </Link>
                    <DeleteQuestionButton questionId={question.id} questionTitle={question.title} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
