"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select } from "@/components/ui";

export function RuleForm({
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
  const [destinationType, setDestinationType] = useState<"question" | "end">(initialData?.destinationType || "question");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const needsCompareValue = operator !== "is_true" && operator !== "is_false" && operator !== "any";

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
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="sourceQuestionId" className="type-body-sm ui-text-primary">Source question *</label>
        <Select id="sourceQuestionId" name="sourceQuestionId" defaultValue={initialData?.sourceQuestionId || ""} required>
          <option value="">Select a question</option>
          {questions.map((q) => (
            <option key={q.id} value={q.id}>#{q.order + 1} - {q.title} ({q.key})</option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="operator" className="type-body-sm ui-text-primary">Operator *</label>
        <Select id="operator" name="operator" value={operator} onChange={(e) => setOperator(e.target.value)} required>
          <option value="equals">equals</option>
          <option value="not_equals">not equals</option>
          <option value="contains">contains</option>
          <option value="is_true">is true (yes/no only)</option>
          <option value="is_false">is false (yes/no only)</option>
          <option value="any">any value (else)</option>
        </Select>
      </div>

      {needsCompareValue && (
        <div className="flex flex-col gap-2">
          <label htmlFor="compareValue" className="type-body-sm ui-text-primary">Compare value *</label>
          <Input type="text" id="compareValue" name="compareValue" defaultValue={initialData?.compareValue || ""} required={needsCompareValue} />
          <small className="type-meta-sm ui-text-muted">For dropdown/multi use choice value; for text fields use exact value.</small>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="type-body-sm ui-text-primary">Destination *</label>
        <label className="inline-flex items-center gap-2">
          <input type="radio" name="destinationType" value="question" checked={destinationType === "question"} onChange={(e) => setDestinationType(e.target.value as "question" | "end")} />
          <span className="type-body-sm">Go to question</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="radio" name="destinationType" value="end" checked={destinationType === "end"} onChange={(e) => setDestinationType(e.target.value as "question" | "end")} />
          <span className="type-body-sm">End form</span>
        </label>
      </div>

      {destinationType === "question" && (
        <div className="flex flex-col gap-2">
          <label htmlFor="destinationQuestionId" className="type-body-sm ui-text-primary">Destination question *</label>
          <Select id="destinationQuestionId" name="destinationQuestionId" defaultValue={initialData?.destinationQuestionId || ""} required>
            <option value="">Select a question</option>
            {questions.map((q) => (
              <option key={q.id} value={q.id}>#{q.order + 1} - {q.title} ({q.key})</option>
            ))}
          </Select>
        </div>
      )}

      <div className="mt-1 flex gap-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : initialData ? "Update rule" : "Add rule"}</Button>
      </div>
    </form>
  );
}
