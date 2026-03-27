"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select } from "@/components/ui";

type Question = {
  id: string;
  order: number;
  type: string;
  key: string;
  title: string;
  choices: Array<{ id: string; order: number; value: string; label: string }>;
};

const LOGIC_SOURCE_TYPES = new Set(["multi", "dropdown", "yesno"]);

function getLogicSourceQuestions(questions: Question[], initialSourceId?: string) {
  const filtered = questions.filter((q) => LOGIC_SOURCE_TYPES.has(q.type));
  if (initialSourceId) {
    const legacy = questions.find((q) => q.id === initialSourceId);
    if (legacy && !LOGIC_SOURCE_TYPES.has(legacy.type)) {
      const ids = new Set(filtered.map((q) => q.id));
      if (!ids.has(legacy.id)) {
        return [legacy, ...filtered];
      }
    }
  }
  return filtered;
}

function LogicCompareValueField({
  question,
  value,
  onChange,
}: {
  question: Question | undefined;
  value: string;
  onChange: (v: string) => void;
}) {
  if (!question) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Select a question first"
        disabled
        className="opacity-60"
      />
    );
  }

  if (question.type === "yesno") {
    return (
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </Select>
    );
  }

  if (question.type === "multi" || question.type === "dropdown") {
    const choices = question.choices || [];
    if (choices.length === 0) {
      return (
        <p className="type-body-sm ui-text-secondary py-2">
          Add choices to this question first.
        </p>
      );
    }
    return (
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select an option</option>
        {choices.map((c) => (
          <option key={c.id} value={c.value}>
            {c.label}
          </option>
        ))}
      </Select>
    );
  }

  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Exact value to match"
    />
  );
}

export function RuleForm({
  formId,
  questions,
  action,
  initialData,
}: {
  formId: string;
  questions: Question[];
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
  const logicSourceQuestions = useMemo(
    () => getLogicSourceQuestions(questions, initialData?.sourceQuestionId),
    [questions, initialData?.sourceQuestionId],
  );

  const [operator, setOperator] = useState(initialData?.operator || "equals");
  const [destinationType, setDestinationType] = useState<"question" | "end">(
    initialData?.destinationType || "question",
  );
  const [sourceQuestionId, setSourceQuestionId] = useState(initialData?.sourceQuestionId || "");
  const [compareValue, setCompareValue] = useState(initialData?.compareValue || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sourceQuestion = useMemo(
    () => questions.find((q) => q.id === sourceQuestionId),
    [questions, sourceQuestionId],
  );

  const needsCompareValue = operator !== "is_true" && operator !== "is_false" && operator !== "any";

  const compareBlocked =
    needsCompareValue &&
    sourceQuestion &&
    (sourceQuestion.type === "multi" || sourceQuestion.type === "dropdown") &&
    (sourceQuestion.choices || []).length === 0;

  const noSourceQuestions = logicSourceQuestions.length === 0;

  async function handleSubmit(formData: FormData) {
    if (noSourceQuestions) {
      alert("Add a multiple choice, dropdown, or yes/no question first.");
      return;
    }
    if (needsCompareValue) {
      if (compareBlocked) {
        alert("Add choices to the source question before saving this rule.");
        return;
      }
      const cv = formData.get("compareValue");
      if (!cv || String(cv).trim() === "") {
        alert("Compare value is required for this operator.");
        return;
      }
    }
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
    <form key={formId} action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="sourceQuestionId" className="type-body-sm ui-text-primary">
          Source question *
        </label>
        <Select
          id="sourceQuestionId"
          name="sourceQuestionId"
          value={sourceQuestionId}
          onChange={(e) => {
            setSourceQuestionId(e.target.value);
            setCompareValue("");
          }}
          required
        >
          <option value="">Select a question</option>
          {logicSourceQuestions.map((q) => (
            <option key={q.id} value={q.id}>
              #{q.order + 1} - {q.title} ({q.key})
            </option>
          ))}
        </Select>
        {logicSourceQuestions.length === 0 && (
          <p className="type-body-sm ui-text-secondary m-0">
            Add a multiple choice, dropdown, or yes/no question to create branching rules.
          </p>
        )}
        <small className="type-meta-sm ui-text-muted">
          Logic rules use multiple choice, dropdown, or yes/no answers. Older rules on other types can still be edited here.
        </small>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="operator" className="type-body-sm ui-text-primary">
          Operator *
        </label>
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
          <label htmlFor="compareValue" className="type-body-sm ui-text-primary">
            Compare value *
          </label>
          <input type="hidden" name="compareValue" value={compareValue} />
          <LogicCompareValueField question={sourceQuestion} value={compareValue} onChange={setCompareValue} />
          {sourceQuestion?.type === "yesno" && (
            <small className="type-meta-sm ui-text-muted">
              Yes/no answers are stored as true or false — match what you pick here.
            </small>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="type-body-sm ui-text-primary">Destination *</label>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="destinationType"
            value="question"
            checked={destinationType === "question"}
            onChange={(e) => setDestinationType(e.target.value as "question" | "end")}
          />
          <span className="type-body-sm">Go to question</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="destinationType"
            value="end"
            checked={destinationType === "end"}
            onChange={(e) => setDestinationType(e.target.value as "question" | "end")}
          />
          <span className="type-body-sm">End form</span>
        </label>
      </div>

      {destinationType === "question" && (
        <div className="flex flex-col gap-2">
          <label htmlFor="destinationQuestionId" className="type-body-sm ui-text-primary">
            Destination question *
          </label>
          <Select id="destinationQuestionId" name="destinationQuestionId" defaultValue={initialData?.destinationQuestionId || ""} required>
            <option value="">Select a question</option>
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                #{q.order + 1} - {q.title} ({q.key})
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="mt-1 flex gap-2">
        <Button type="submit" disabled={isSubmitting || compareBlocked || noSourceQuestions}>
          {isSubmitting ? "Saving..." : initialData ? "Update rule" : "Add rule"}
        </Button>
      </div>
    </form>
  );
}
