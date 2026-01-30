import Link from "next/link";
import { notFound } from "next/navigation";
import { getForm, updateForm } from "../actions";
import { getQuestions } from "./questions/actions";
import { MoveQuestionButton, DeleteQuestionButton } from "./questions/components/QuestionActions";

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const form = await getForm(id);

  if (!form) {
    notFound();
  }

  const questions = await getQuestions(id);

  async function handleUpdate(formData: FormData) {
    "use server";
    try {
      await updateForm(id, formData);
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
        maxWidth: "600px",
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
          Edit Form
        </h1>
        <Link
          href="/admin/qanda/forms"
          style={{
            color: "#0066cc",
            textDecoration: "underline",
            fontSize: "0.9rem",
          }}
        >
          Back to forms
        </Link>
      </div>

      <form
        action={handleUpdate}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <label
            htmlFor="name"
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Name <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={form.name}
            required
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <label
            htmlFor="slug"
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Slug <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            defaultValue={form.slug}
            required
            pattern="[a-z0-9-]+"
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          />
          <small
            style={{
              fontSize: "0.8rem",
              color: "#666",
            }}
          >
            Lowercase letters, numbers, and hyphens only. No spaces.
          </small>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <label
            htmlFor="status"
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={form.status}
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <label
            htmlFor="redirectUrl"
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Redirect URL (optional)
          </label>
          <input
            type="url"
            id="redirectUrl"
            name="redirectUrl"
            defaultValue={form.redirectUrl || ""}
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <label
            htmlFor="zapierHookUrl"
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Zapier Hook URL (optional)
          </label>
          <input
            type="url"
            id="zapierHookUrl"
            name="zapierHookUrl"
            defaultValue={form.zapierHookUrl || ""}
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          <button
            type="submit"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#0066cc",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Save Changes
          </button>
          <Link
            href="/admin/qanda/forms"
            style={{
              padding: "0.75rem 1.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              textDecoration: "none",
              color: "#000",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Questions Section */}
      <div
        style={{
          marginTop: "3rem",
          paddingTop: "2rem",
          borderTop: "1px solid #e5e5e5",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              margin: 0,
            }}
          >
            Questions
          </h2>
          <Link
            href={`/admin/qanda/forms/${id}/questions/new`}
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
            Add Question
          </Link>
        </div>

        {questions.length === 0 ? (
          <p
            style={{
              color: "#333",
              fontSize: "1rem",
            }}
          >
            No questions yet. Add your first question to get started.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {questions.map((question) => (
              <div
                key={question.id}
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
                        fontSize: "0.9rem",
                        color: "#333",
                        fontWeight: "500",
                      }}
                    >
                      #{question.order + 1}
                    </span>
                    <Link
                      href={`/admin/qanda/forms/${id}/questions/${question.id}`}
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "500",
                        color: "#0066cc",
                        textDecoration: "none",
                      }}
                    >
                      {question.title}
                    </Link>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        backgroundColor: "#e5e5e5",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        color: "#000",
                        fontWeight: "500",
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
                          fontWeight: "500",
                        }}
                      >
                        Required
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      fontSize: "0.9rem",
                      color: "#333",
                    }}
                  >
                    <span>Key: <strong>{question.key}</strong></span>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                  }}
                >
                  <MoveQuestionButton
                    formId={id}
                    questionId={question.id}
                    direction="up"
                    disabled={question.order === 0}
                  />
                  <MoveQuestionButton
                    formId={id}
                    questionId={question.id}
                    direction="down"
                    disabled={question.order === questions.length - 1}
                  />
                  <Link
                    href={`/admin/qanda/forms/${id}/questions/${question.id}`}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      textDecoration: "none",
                      color: "#000",
                      backgroundColor: "#fff",
                      fontSize: "0.9rem",
                    }}
                  >
                    Edit
                  </Link>
                  <DeleteQuestionButton questionId={question.id} questionTitle={question.title} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
