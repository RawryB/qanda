import Link from "next/link";
import { notFound } from "next/navigation";
import { getForm } from "../../actions";
import { getQuestions } from "../questions/actions";
import { getRules, createRule, deleteRule, moveRule } from "./actions";
import { RuleForm } from "./components/RuleForm";
import { MoveRuleButton, DeleteRuleButton } from "./components/RuleActions";

export default async function RulesPage({
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
  const rules = await getRules(id);

  async function handleCreateRule(formData: FormData) {
    "use server";
    try {
      await createRule(id, formData);
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
        maxWidth: "900px",
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
          Branching Rules
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

      <div
        style={{
          padding: "1rem",
          backgroundColor: "#f0f8ff",
          borderRadius: "4px",
          fontSize: "0.9rem",
          color: "#333",
        }}
      >
        <strong>How it works:</strong> Rules are evaluated in priority order (lower number = evaluated first).
        When a user answers a question, rules for that question are checked. The first matching rule determines
        the next question or ends the form. If no rules match, the form continues to the next question in order.
      </div>

      {/* Add Rule Form */}
      <div
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: "4px",
          padding: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "bold",
            margin: "0 0 1rem 0",
          }}
        >
          Add Rule
        </h2>
        <RuleForm formId={id} questions={questions} action={handleCreateRule} />
      </div>

      {/* Existing Rules */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          Existing Rules
        </h2>

        {rules.length === 0 ? (
          <p
            style={{
              color: "#333",
              fontSize: "1rem",
            }}
          >
            No rules defined yet. Add a rule above to enable branching logic.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {rules.map((rule) => {
              const destinationQuestion = rule.destinationQuestionId
                ? questions.find((q) => q.id === rule.destinationQuestionId)
                : null;

              // Get all rules for this source question to determine move button states
              const sourceRules = rules.filter(
                (r) => r.sourceQuestionId === rule.sourceQuestionId
              );
              const sourceRulesSorted = sourceRules.sort((a, b) => a.priority - b.priority);
              const currentIndex = sourceRulesSorted.findIndex((r) => r.id === rule.id);
              const canMoveUp = currentIndex > 0;
              const canMoveDown = currentIndex < sourceRulesSorted.length - 1;

              return (
                <div
                  key={rule.id}
                  style={{
                    border: "1px solid #e5e5e5",
                    borderRadius: "4px",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "1rem",
                            fontWeight: "500",
                          }}
                        >
                          When answering: <strong>{rule.sourceQuestion.title}</strong> ({rule.sourceQuestion.key})
                        </span>
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            backgroundColor: "#e5e5e5",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                          }}
                        >
                          Priority: {rule.priority}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          alignItems: "center",
                          fontSize: "0.9rem",
                          color: "#333",
                        }}
                      >
                        <span>
                          <strong>Operator:</strong> {rule.operator}
                        </span>
                        {rule.compareValue && (
                          <span>
                            <strong>Compare:</strong> {rule.compareValue}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          color: "#333",
                        }}
                      >
                        <strong>Then:</strong>{" "}
                        {rule.isEnd ? (
                          <span style={{ color: "#c33", fontWeight: "500" }}>End form</span>
                        ) : destinationQuestion ? (
                          <span>
                            Go to <strong>{destinationQuestion.title}</strong> ({destinationQuestion.key})
                          </span>
                        ) : (
                          <span style={{ color: "#c33" }}>Invalid destination (question deleted)</span>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                      }}
                    >
                      <MoveRuleButton
                        formId={id}
                        ruleId={rule.id}
                        direction="up"
                        disabled={!canMoveUp}
                      />
                      <MoveRuleButton
                        formId={id}
                        ruleId={rule.id}
                        direction="down"
                        disabled={!canMoveDown}
                      />
                      <Link
                        href={`/admin/qanda/forms/${id}/rules/${rule.id}/edit`}
                        style={{
                          padding: "0.5rem 1rem",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          textDecoration: "none",
                          color: "#000",
                          backgroundColor: "#fff",
                          fontSize: "0.9rem",
                        }}
                      >
                        Edit
                      </Link>
                      <DeleteRuleButton
                        ruleId={rule.id}
                        formId={id}
                        ruleDescription={`${rule.sourceQuestion.title} → ${rule.isEnd ? "End" : destinationQuestion?.title || "Invalid"}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
