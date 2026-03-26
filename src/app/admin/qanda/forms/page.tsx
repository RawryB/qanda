import Link from "next/link";
import { getForms } from "./actions";
import { DeleteFormButton } from "./components/DeleteFormButton";
import { Badge, Button, Card } from "@/components/ui";

export default async function QandaFormsPage() {
  const forms = await getForms();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="type-display-md m-0">QandA forms</h1>
        <Link href="/admin/qanda/forms/new" className="no-underline">
          <Button>New form</Button>
        </Link>
      </div>

      {forms.length === 0 ? (
        <p className="type-body-md ui-text-secondary">
          No forms yet. Create your first form to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id} className="flex flex-col gap-4 p-4">
              <div className="h-1 w-full rounded-full" style={{ background: form.status === "published" ? "var(--success-fg)" : "var(--border-subtle)" }} />

              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-1 items-center gap-2">
                  <Link
                    href={`/admin/qanda/forms/${form.id}`}
                    className="type-heading-md ui-text-primary no-underline hover:underline"
                  >
                    {form.name}
                  </Link>
                  <Badge variant={form.status === "published" ? "live" : "draft"}>{form.status}</Badge>
                </div>
              </div>

              <div className="type-meta-sm ui-text-secondary">
                {form.questionCount} questions
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="type-heading-md">{form.responseCount}</div>
                  <div className="type-meta-sm ui-text-secondary">Responses</div>
                </div>
                <div>
                  <div className="type-heading-md">{form.completionRate === null ? "—" : `${form.completionRate}%`}</div>
                  <div className="type-meta-sm ui-text-secondary">Completion</div>
                </div>
              </div>

              <div className="flex justify-start gap-1">
                <Link href={`/admin/qanda/forms/${form.id}`} className="no-underline">
                  <Button variant="ghost" size="sm" className="px-2" title="Edit form">
                    ✎
                  </Button>
                </Link>
                <DeleteFormButton formId={form.id} formName={form.name} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
