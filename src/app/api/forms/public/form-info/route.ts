import { getPublicFormInfo } from "@/lib/forms/get-public-form-info";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const preview = searchParams.get("preview") === "1";

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const result = await getPublicFormInfo(slug, preview);

    if (!result.ok) {
      const status = result.error === "Unauthorized preview request" ? 401 : 404;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(result.form);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error, "Failed to fetch form") }, { status: 500 });
  }
}
