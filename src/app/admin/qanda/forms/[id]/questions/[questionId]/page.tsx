import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getQuestion, updateQuestion, deleteQuestion } from "../../actions";
import { ChoiceManager } from "./components/ChoiceManager";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string; questionId: string }>;
}) {
  const { id, questionId } = await params;
  const question = await getQuestion(questionId);

  if (!question) {
    notFound();
  }

  async function handleUpdate(formData: FormData) {
    "use server";
    try {
      await updateQuestion(questionId, formData);
    } catch (error: any) {
      throw error;
    }
  }

  async function handleDelete() {
    "use server";
    try {
      await deleteQuestion(questionId);
      redirect(`/admin/qanda/forms/${id}`);
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
          Edit Question
        </h1>
        <Link
          href={`/admin/qanda/forms/${id}`}
          style={{
            color: "#0066cc",
            textDecoration: "underline",
            fontSize: "0.9rem",
          }}
        >
          Back to form
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
            htmlFor="type"
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Type <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <select
            id="type"
            name="type"
            defaultValue={question.type}
            required
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          >
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="yesno">Yes/No</option>
            <option value="multi">Multiple Choice</option>
            <option value="dropdown">Dropdown</option>
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
            htmlFor="key"
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Key <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="text"
            id="key"
            name="key"
            defaultValue={question.key}
            required
            pattern="[a-z0-9_]+"
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
            Lowercase letters, numbers, and underscores only. No spaces.
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
            htmlFor="title"
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Title <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={question.title}
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
            htmlFor="helpText"
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Help Text (optional)
          </label>
          <textarea
            id="helpText"
            name="helpText"
            rows={3}
            defaultValue={question.helpText || ""}
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
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <input
            type="checkbox"
            id="required"
            name="required"
            defaultChecked={question.required}
            style={{
              width: "1rem",
              height: "1rem",
            }}
          />
          <label
            htmlFor="required"
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Required
          </label>
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
            href={`/admin/qanda/forms/${id}`}
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
          <form action={handleDelete}>
            <button
              type="submit"
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: "pointer",
              }}
              onClick={(e) => {
                if (!confirm("Are you sure you want to delete this question?")) {
                  e.preventDefault();
                }
              }}
            >
              Delete
            </button>
          </form>
        </div>
      </form>

      {/* Choices Section (only for multi/dropdown) */}
      {(question.type === "multi" || question.type === "dropdown") && (
        <div
          style={{
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: "1px solid #e5e5e5",
          }}
        >
          <ChoiceManager questionId={questionId} choices={question.choices} />
        </div>
      )}
    </div>
  );
}
