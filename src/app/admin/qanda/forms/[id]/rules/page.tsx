import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button, Card } from "@/components/ui";
import { getForm } from "../../actions";
import { getQuestions } from "../questions/actions";
import { createRule, getRules } from "./actions";
import { MoveRuleButton, DeleteRuleButton } from "./components/RuleActions";
import { RuleForm } from "./components/RuleForm";

export default async function RulesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await getForm(id);
  if (!form) notFound();

  const questions = await getQuestions(id);
  const rules = await getRules(id);

  async function handleCreateRule(formData: FormData) {
    "use server";
    await createRule(id, formData);
  }

  return (
    <div className="flex max-w-[1000px] flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="type-display-md m-0">Branching rules</h1>
        <Link href={`/admin/qanda/forms/${id}`} className="type-body-sm ui-text-secondary">Back to form</Link>
      </div>

      <Card className="p-4">
        <p className="type-body-sm ui-text-secondary m-0">
          Rules are evaluated in priority order. First matching rule determines destination.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="type-heading-lg mb-4 mt-0">Add rule</h2>
        <RuleForm formId={id} questions={questions} action={handleCreateRule} />
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="type-heading-lg m-0">Existing rules</h2>
        {rules.length === 0 ? (
          <p className="type-body-md ui-text-secondary">No rules defined yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {rules.map((rule) => {
              const destinationQuestion = rule.destinationQuestionId
                ? questions.find((q) => q.id === rule.destinationQuestionId)
                : null;
              const sourceRulesSorted = rules
                .filter((r) => r.sourceQuestionId === rule.sourceQuestionId)
                .sort((a, b) => a.priority - b.priority);
              const currentIndex = sourceRulesSorted.findIndex((r) => r.id === rule.id);
              const canMoveUp = currentIndex > 0;
              const canMoveDown = currentIndex < sourceRulesSorted.length - 1;

              return (
                <Card key={rule.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="type-body-md">When <strong>{rule.sourceQuestion.title}</strong> ({rule.sourceQuestion.key})</span>
                        <Badge>Priority {rule.priority}</Badge>
                      </div>
                      <div className="type-body-sm ui-text-secondary">
                        Operator: <strong>{rule.operator}</strong>{rule.compareValue ? ` | Compare: ${rule.compareValue}` : ""}
                      </div>
                      <div className="type-body-sm">
                        Then:{" "}
                        {rule.isEnd ? (
                          <span className="text-[var(--danger-fg)]">End form</span>
                        ) : destinationQuestion ? (
                          <span>Go to <strong>{destinationQuestion.title}</strong> ({destinationQuestion.key})</span>
                        ) : (
                          <span className="text-[var(--danger-fg)]">Invalid destination</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <MoveRuleButton formId={id} ruleId={rule.id} direction="up" disabled={!canMoveUp} />
                      <MoveRuleButton formId={id} ruleId={rule.id} direction="down" disabled={!canMoveDown} />
                      <Link href={`/admin/qanda/forms/${id}/rules/${rule.id}/edit`} className="no-underline">
                        <Button variant="ghost">Edit</Button>
                      </Link>
                      <DeleteRuleButton
                        ruleId={rule.id}
                        formId={id}
                        ruleDescription={`${rule.sourceQuestion.title} -> ${rule.isEnd ? "End" : destinationQuestion?.title || "Invalid"}`}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
