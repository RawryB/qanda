import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatAnswerValue(answer: any): string {
  if (answer.valueText) {
    return answer.valueText;
  }
  if (answer.valueJson !== null && answer.valueJson !== undefined) {
    return JSON.stringify(answer.valueJson);
  }
  return "(no answer)";
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;

  const submission = await prisma.qandaSubmission.findUnique({
    where: { id: submissionId },
    include: {
      form: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      answers: {
        include: {
          question: true,
        },
      },
      webhookAttempts: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!submission) {
    notFound();
  }

  // Get all questions for the form to show unanswered ones
  const allQuestions = await prisma.qandaQuestion.findMany({
    where: { formId: submission.formId },
    orderBy: { order: "asc" },
  });

  // Create a map of answered question IDs
  const answeredQuestionIds = new Set(submission.answers.map((a) => a.questionId));

  // Combine answered and unanswered questions
  const questionsWithAnswers = allQuestions.map((question) => {
    const answer = submission.answers.find((a) => a.questionId === question.id);
    return {
      question,
      answer: answer || null,
    };
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        maxWidth: "800px",
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
          Submission Details
        </h1>
        <Link
          href="/admin/qanda/submissions"
          style={{
            color: "#0066cc",
            textDecoration: "underline",
            fontSize: "0.9rem",
          }}
        >
          Back to submissions
        </Link>
      </div>

      {/* Submission Metadata */}
      <div
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: "4px",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
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
                fontSize: "1.2rem",
                fontWeight: "500",
              }}
            >
              Form: {submission.form.name}
            </span>
            <span
              style={{
                fontSize: "0.9rem",
                color: "#666",
              }}
            >
              ({submission.form.slug})
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
            }}
          >
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
              flexDirection: "column",
              gap: "0.25rem",
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
      </div>

      {/* Answers Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          Answers
        </h2>

        {questionsWithAnswers.length === 0 ? (
          <p
            style={{
              color: "#333",
              fontSize: "1rem",
            }}
          >
            No questions in this form.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {questionsWithAnswers.map(({ question, answer }) => (
              <div
                key={question.id}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: "4px",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
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
                      fontSize: "1rem",
                      fontWeight: "500",
                    }}
                  >
                    {question.title}
                  </span>
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      backgroundColor: "#f0f0f0",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {question.type}
                  </span>
                  {question.required && (
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        backgroundColor: "#fee",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        color: "#c33",
                      }}
                    >
                      Required
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    fontSize: "0.9rem",
                    color: "#666",
                  }}
                >
                  <span>
                    <strong>Key:</strong> {question.key}
                  </span>
                </div>
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    color: "#000",
                  }}
                >
                  {answer ? formatAnswerValue(answer) : "(no answer)"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Webhook Attempts Section */}
      {submission.status === "completed" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              margin: 0,
            }}
          >
            Webhook Attempts
          </h2>

          {submission.webhookAttempts.length === 0 ? (
            <p
              style={{
                color: "#333",
                fontSize: "1rem",
              }}
            >
              No webhook attempts recorded.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {submission.webhookAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  style={{
                    border: "1px solid #e5e5e5",
                    borderRadius: "4px",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    fontSize: "0.9rem",
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
                        fontWeight: "500",
                      }}
                    >
                      Attempt {attempt.attempt}
                    </span>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        backgroundColor: attempt.success ? "#e5f5e5" : "#fee",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        color: attempt.success ? "#2d5a2d" : "#c33",
                        fontWeight: "500",
                      }}
                    >
                      {attempt.success ? "Success" : "Failed"}
                    </span>
                    {attempt.statusCode && (
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "#666",
                        }}
                      >
                        Status: {attempt.statusCode}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "#666",
                        marginLeft: "auto",
                      }}
                    >
                      {formatDate(attempt.createdAt)}
                    </span>
                  </div>
                  {attempt.error && (
                    <div
                      style={{
                        padding: "0.5rem",
                        backgroundColor: "#fee",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                        color: "#c33",
                      }}
                    >
                      {attempt.error}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#666",
                      wordBreak: "break-all",
                    }}
                  >
                    URL: {attempt.url}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
