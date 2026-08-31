import { renderTemplate } from "@/lib/qanda/template";

export type PublicQuestion = {
  id: string;
  type: string;
  title: string;
  helpText: string | null;
  renderedTitle: string;
  renderedHelpText: string | null;
  required: boolean;
  key: string;
  choices: Array<{ value: string; label: string }>;
};

export function toPublicQuestion(
  question: {
    id: string;
    type: string;
    title: string;
    helpText: string | null;
    required: boolean;
    key: string;
    choices: Array<{ value: string; label: string }>;
  },
  values: Record<string, string> = {},
): PublicQuestion {
  return {
    id: question.id,
    type: question.type,
    title: question.title,
    helpText: question.helpText,
    renderedTitle: renderTemplate(question.title, values),
    renderedHelpText: renderTemplate(question.helpText, values) || null,
    required: question.required,
    key: question.key,
    choices: question.choices.map((choice) => ({
      value: choice.value,
      label: choice.label,
    })),
  };
}
