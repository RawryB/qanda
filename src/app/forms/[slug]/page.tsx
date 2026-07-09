import { getPublicFormInfo } from "@/lib/forms/get-public-form-info";
import { buildRunnerGoogleFontsHref } from "@/lib/forms/runner-fonts";
import { FormsRunnerClient } from "./FormsRunnerClient";

export default async function FormsRunnerPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";
  const result = await getPublicFormInfo(slug, isPreview);
  const formInfo = result.ok ? result.form : null;
  const initialError = result.ok ? null : result.error;
  const fontHref = formInfo ? buildRunnerGoogleFontsHref(formInfo.primaryFont, formInfo.secondaryFont) : null;

  return (
    <>
      {fontHref && <link rel="stylesheet" href={fontHref} />}
      <FormsRunnerClient
        slug={slug}
        isPreview={isPreview}
        initialFormInfo={formInfo}
        initialError={initialError}
      />
    </>
  );
}
