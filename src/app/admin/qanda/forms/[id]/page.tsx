import { notFound } from "next/navigation";
import { getForm } from "../actions";
import { getQuestions } from "./questions/actions";
import { getRules } from "./rules/actions";
import { getOutcomeRules } from "./routing/actions";
import { FormEditorWorkspace } from "./components/FormEditorWorkspace";

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const form = await getForm(id);
  if (!form) notFound();

  const questions = await getQuestions(id);
  const rules = await getRules(id);
  const outcomeRules = await getOutcomeRules(id);

  return (
    <FormEditorWorkspace
      form={{
        id: form.id,
        name: form.name,
        slug: form.slug,
        status: form.status,
        primaryColor: form.primaryColor,
        accentColor: form.accentColor,
        transitionColor: form.transitionColor,
        primaryFont: form.primaryFont,
        secondaryFont: form.secondaryFont,
        logoUrl: form.logoUrl,
        redirectUrl: form.redirectUrl,
        zapierHookUrl: form.zapierHookUrl,
        backgroundImageUrl: form.backgroundImageUrl,
        introText: form.introText,
        completionTitle: form.completionTitle,
        completionMessage: form.completionMessage,
        showQuestionCount: form.showQuestionCount,
      }}
      questions={questions.map((q) => ({
        id: q.id,
        order: q.order,
        type: q.type,
        key: q.key,
        title: q.title,
        helpText: q.helpText,
        required: q.required,
        choices: q.choices.map((c) => ({
          id: c.id,
          order: c.order,
          value: c.value,
          label: c.label,
        })),
      }))}
      rules={rules.map((rule) => ({
        id: rule.id,
        sourceQuestionId: rule.sourceQuestionId,
        operator: rule.operator,
        compareValue: rule.compareValue,
        destinationQuestionId: rule.destinationQuestionId,
        isEnd: rule.isEnd,
        priority: rule.priority,
        sourceQuestion: {
          id: rule.sourceQuestion.id,
          title: rule.sourceQuestion.title,
          key: rule.sourceQuestion.key,
          order: rule.sourceQuestion.order,
        },
      }))}
      outcomeRules={outcomeRules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        priority: rule.priority,
        isActive: rule.isActive,
        matchType: rule.matchType,
        destinationType: rule.destinationType,
        destinationValue: rule.destinationValue,
        segmentKey: rule.segmentKey,
        conditions: rule.conditions.map((condition) => ({
          id: condition.id,
          questionId: condition.questionId,
          operator: condition.operator,
          value: condition.value,
          question: condition.question
            ? {
                id: condition.question.id,
                title: condition.question.title,
                key: condition.question.key,
                order: condition.question.order,
              }
            : null,
        })),
      }))}
    />
  );
}
