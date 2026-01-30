import Link from "next/link";
import { notFound } from "next/navigation";
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
    include: {
      sourceQuestion: true,
    },
  });

  if (!rule || rule.formId !== id) {
    notFound();
  }

  async function handleUpdateRule(formData: FormData) {
    "use server";
    try {
      await updateRule(ruleId, id, formData);
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
          Edit Rule
        </h1>
        <Link
          href={`/admin/qanda/forms/${id}/rules`}
          style={{
            color: "#0066cc",
            textDecoration: "underline",
            fontSize: "0.9rem",
          }}
        >
          Back to rules
        </Link>
      </div>

      <div
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: "4px",
          padding: "1.5rem",
        }}
      >
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
      </div>
    </div>
  );
}
