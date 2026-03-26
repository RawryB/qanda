import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getForms } from "../forms/actions";
import { FormFilter } from "./components/FormFilter";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function QandaSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ formId?: string }>;
}) {
  const params = await searchParams;
  const formIdFilter = params.formId;
  const forms = await getForms();

  const where: any = {};
  if (formIdFilter) where.formId = formIdFilter;

  const submissions = await prisma.qandaSubmission.findMany({
    where,
    include: { form: { select: { id: true, name: true, slug: true } } },
    orderBy: [{ completedAt: "desc" }, { startedAt: "desc" }],
    take: 100,
  });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="type-display-md m-0">QandA submissions</h1>
      <FormFilter forms={forms} currentFormId={formIdFilter} />

      {submissions.length === 0 ? (
        <p className="type-body-md ui-text-secondary">No submissions found.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="type-heading-md">{submission.form.name}</span>
                  <Badge variant={submission.status === "completed" ? "live" : "draft"}>{submission.status}</Badge>
                </div>
                <div className="type-meta-sm ui-text-secondary flex gap-4">
                  <span>Started: {formatDate(submission.startedAt)}</span>
                  {submission.completedAt && <span>Completed: {formatDate(submission.completedAt)}</span>}
                </div>
              </div>
              <Link href={`/admin/qanda/submissions/${submission.id}`} className="no-underline">
                <Button>View</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
