"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RuleForm({
  formId,
  questions,
  action,
  initialData,
}: {
  formId: string;
  questions: any[];
  action: (formData: FormData) => Promise<void>;
  initialData?: {
    sourceQuestionId?: string;
    operator?: string;
    compareValue?: string;
    destinationType?: "question" | "end";
    destinationQuestionId?: string;
  };
}) {
  const router = useRouter();
  const [operator, setOperator] = useState(initialData?.operator || "equals");
  const [destinationType, setDestinationType] = useState<"question" | "end">(
    initialData?.destinationType || "question"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const needsCompareValue = operator !== "is_true" && operator !== "is_false";

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await action(formData);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to save rule");
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label
          htmlFor="sourceQuestionId"
          style={{
            fontSize: "0.9rem",
            fontWeight: "500",
          }}
        >
          Source Question <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <select
          id="sourceQuestionId"
          name="sourceQuestionId"
          defaultValue={initialData?.sourceQuestionId || ""}
          required
          style={{
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "1rem",
          }}
        >
          <option value="">Select a question</option>
          {questions.map((q) => (
            <option key={q.id} value={q.id}>
              #{q.order + 1} - {q.title} ({q.key})
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label
          htmlFor="operator"
          style={{
            fontSize: "0.9rem",
            fontWeight: "500",
          }}
        >
          Operator <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <select
          id="operator"
          name="operator"
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          required
          style={{
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "1rem",
          }}
        >
          <option value="equals">equals</option>
          <option value="not_equals">not equals</option>
          <option value="contains">contains</option>
          <option value="is_true">is true (yesno only)</option>
          <option value="is_false">is false (yesno only)</option>
        </select>
      </div>

      {needsCompareValue && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label
            htmlFor="compareValue"
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Compare Value <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="text"
            id="compareValue"
            name="compareValue"
            defaultValue={initialData?.compareValue || ""}
            required={needsCompareValue}
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          />
          <small style={{ fontSize: "0.8rem", color: "#666" }}>
            For dropdown/multi: use the choice value. For text/email/phone: use the exact text.
          </small>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label
          style={{
            fontSize: "0.9rem",
            fontWeight: "500",
          }}
        >
          Destination <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="radio"
              name="destinationType"
              value="question"
              checked={destinationType === "question"}
              onChange={(e) => setDestinationType(e.target.value as "question" | "end")}
            />
            <span>Go to question</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="radio"
              name="destinationType"
              value="end"
              checked={destinationType === "end"}
              onChange={(e) => setDestinationType(e.target.value as "question" | "end")}
            />
            <span>End form</span>
          </label>
        </div>
      </div>

      {destinationType === "question" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label
            htmlFor="destinationQuestionId"
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Destination Question <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <select
            id="destinationQuestionId"
            name="destinationQuestionId"
            defaultValue={initialData?.destinationQuestionId || ""}
            required={destinationType === "question"}
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          >
            <option value="">Select a question</option>
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                #{q.order + 1} - {q.title} ({q.key})
              </option>
            ))}
          </select>
          <small style={{ fontSize: "0.8rem", color: "#666" }}>
            Note: Cannot select the same question as the source (prevents infinite loops).
          </small>
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#0066cc",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "1rem",
            fontWeight: "500",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.6 : 1,
          }}
        >
          {isSubmitting ? "Saving..." : initialData ? "Update Rule" : "Add Rule"}
        </button>
      </div>
    </form>
  );
}
