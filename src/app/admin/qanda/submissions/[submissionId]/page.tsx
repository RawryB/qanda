import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatAnswerValue(answer: any): string {
  if (answer.valueText) return answer.valueText;
  if (answer.valueJson !== null && answer.valueJson !== undefined) return JSON.stringify(answer.valueJson);
  return "(no answer)";
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;
  const submission = await prisma.qandaSubmission.findUnique({
    where: { id: submissionId },
    include: {
      form: { select: { id: true, name: true, slug: true } },
      answers: { include: { question: true } },
      webhookAttempts: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!submission) notFound();

  const allQuestions = await prisma.qandaQuestion.findMany({
    where: { formId: submission.formId },
    orderBy: { order: "asc" },
  });

  const questionsWithAnswers = allQuestions.map((question) => ({
    question,
    answer: submission.answers.find((a) => a.questionId === question.id) || null,
  }));

  return (
    <div className="flex max-w-[980px] flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="type-display-md m-0">Submission details</h1>
        <Link href="/admin/qanda/submissions" className="type-body-sm ui-text-secondary">Back to submissions</Link>
      </div>

      <Card className="flex flex-col gap-3 p-6">
        <div className="flex items-center gap-3">
          <span className="type-heading-md">Form: {submission.form.name}</span>
          <span className="type-meta-sm ui-text-secondary">({submission.form.slug})</span>
          <Badge variant={submission.status === "completed" ? "live" : "draft"}>{submission.status}</Badge>
        </div>
        <div className="type-body-sm ui-text-secondary flex flex-col gap-1">
          <span>Started: {formatDate(submission.startedAt)}</span>
          {submission.completedAt && <span>Completed: {formatDate(submission.completedAt)}</span>}
        </div>
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="type-heading-lg m-0">Answers</h2>
        {questionsWithAnswers.length === 0 ? (
          <p className="type-body-md ui-text-secondary">No questions in this form.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {questionsWithAnswers.map(({ question, answer }) => (
              <Card key={question.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-2">
                  <span className="type-body-md">{question.title}</span>
                  <Badge>{question.type}</Badge>
                  {question.required && (
                    <span className="inline-flex items-center rounded-[999px] bg-[var(--danger-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--danger-fg)]">
                      Required
                    </span>
                  )}
                </div>
                <div className="type-meta-sm ui-text-secondary">Key: {question.key}</div>
                <div className="ui-surface-field ui-border ui-radius-md px-3 py-2 type-body-md">{answer ? formatAnswerValue(answer) : "(no answer)"}</div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {submission.status === "completed" && (
        <section className="flex flex-col gap-4">
          <h2 className="type-heading-lg m-0">Webhook attempts</h2>
          {submission.webhookAttempts.length === 0 ? (
            <p className="type-body-md ui-text-secondary">No webhook attempts recorded.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {submission.webhookAttempts.map((attempt) => (
                <Card key={attempt.id} className="flex flex-col gap-2 p-4">
                  <div className="flex items-center gap-3">
                    <span className="type-body-sm">Attempt {attempt.attempt}</span>
                    <Badge variant={attempt.success ? "live" : "draft"}>{attempt.success ? "Success" : "Failed"}</Badge>
                    {attempt.statusCode && <span className="type-meta-sm ui-text-secondary">Status: {attempt.statusCode}</span>}
                    <span className="type-meta-sm ui-text-secondary ml-auto">{formatDate(attempt.createdAt)}</span>
                  </div>
                  {attempt.error && (
                    <div className="rounded-[6px] bg-[var(--danger-bg)] px-3 py-2 type-body-sm text-[var(--danger-fg)]">
                      {attempt.error}
                    </div>
                  )}
                  <div className="type-meta-sm ui-text-secondary break-all">URL: {attempt.url}</div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
