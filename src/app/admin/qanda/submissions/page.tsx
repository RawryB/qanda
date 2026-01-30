import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getForms } from "../forms/actions";
import { FormFilter } from "./components/FormFilter";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function QandaSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ formId?: string }>;
}) {
  const params = await searchParams;
  const formIdFilter = params.formId;

  // Get all forms for filter dropdown
  const forms = await getForms();

  // Build where clause
  const where: any = {};
  if (formIdFilter) {
    where.formId = formIdFilter;
  }

  // Get submissions with form info
  const submissions = await prisma.qandaSubmission.findMany({
    where,
    include: {
      form: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [
      { completedAt: "desc" },
      { startedAt: "desc" },
    ],
    take: 100, // Limit to recent 100
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
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
          Qanda Submissions
        </h1>
      </div>

      {/* Form Filter */}
      <FormFilter forms={forms} currentFormId={formIdFilter} />

      {submissions.length === 0 ? (
        <p
          style={{
            color: "#333",
            fontSize: "1rem",
          }}
        >
          No submissions found.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {submissions.map((submission) => (
            <div
              key={submission.id}
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: "4px",
                padding: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "500",
                    }}
                  >
                    {submission.form.name}
                  </span>
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      backgroundColor:
                        submission.status === "completed" ? "#e5f5e5" : "#fff4e5",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      color: submission.status === "completed" ? "#2d5a2d" : "#8b5a00",
                      fontWeight: "500",
                    }}
                  >
                    {submission.status}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    fontSize: "0.9rem",
                    color: "#333",
                  }}
                >
                  <span>Started: {formatDate(submission.startedAt)}</span>
                  {submission.completedAt && (
                    <span>Completed: {formatDate(submission.completedAt)}</span>
                  )}
                </div>
              </div>
              <Link
                href={`/admin/qanda/submissions/${submission.id}`}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#0066cc",
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
