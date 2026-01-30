import Link from "next/link";
import { getForms } from "./actions";
import { DeleteFormButton } from "./components/DeleteFormButton";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function QandaFormsPage() {
  const forms = await getForms();

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
          Qanda Forms
        </h1>
        <Link
          href="/admin/qanda/forms/new"
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
          New Form
        </Link>
      </div>

      {forms.length === 0 ? (
        <p
          style={{
            color: "#666",
            fontSize: "1rem",
          }}
        >
          No forms yet. Create your first form to get started.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {forms.map((form) => (
            <div
              key={form.id}
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
                  <Link
                    href={`/admin/qanda/forms/${form.id}`}
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "500",
                      color: "#000",
                      textDecoration: "none",
                    }}
                  >
                    {form.name}
                  </Link>
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      backgroundColor: "#f0f0f0",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {form.status}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    fontSize: "0.9rem",
                    color: "#666",
                  }}
                >
                  <span>Slug: {form.slug}</span>
                  <span>Updated: {formatDate(form.updatedAt)}</span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                }}
              >
                <Link
                  href={`/admin/qanda/forms/${form.id}`}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    textDecoration: "none",
                    color: "#000",
                    fontSize: "0.9rem",
                  }}
                >
                  Edit
                </Link>
                <DeleteFormButton formId={form.id} formName={form.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
