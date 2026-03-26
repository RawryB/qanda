import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getQuestions } from "../../../questions/actions";
import { updateRule } from "../../actions";
import { RuleForm } from "../../components/RuleForm";

export default async function EditRulePage({
  params,
}: {
  params: Promise<{ id: string; ruleId: string }>;
}) {
  const { id, ruleId } = await params;
  const questions = await getQuestions(id);
  const rule = await prisma.qandaLogicRule.findUnique({
    where: { id: ruleId },
    include: { sourceQuestion: true },
  });

  if (!rule || rule.formId !== id) notFound();

  async function handleUpdateRule(formData: FormData) {
    "use server";
    await updateRule(ruleId, id, formData);
  }

  return (
    <div className="flex max-w-[900px] flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="type-display-md m-0">Edit rule</h1>
        <Link href={`/admin/qanda/forms/${id}/rules`} className="type-body-sm ui-text-secondary">
          Back to rules
        </Link>
      </div>

      <Card className="p-6">
        <RuleForm
          formId={id}
          questions={questions}
          action={handleUpdateRule}
          initialData={{
            sourceQuestionId: rule.sourceQuestionId,
            operator: rule.operator,
            compareValue: rule.compareValue || undefined,
            destinationType: rule.isEnd ? "end" : "question",
            destinationQuestionId: rule.destinationQuestionId || undefined,
          }}
        />
      </Card>
    </div>
  );
}
