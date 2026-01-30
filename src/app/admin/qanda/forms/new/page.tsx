import Link from "next/link";
import { createForm } from "../actions";

export default function NewFormPage() {
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
          New Form
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
        action={createForm}
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
            defaultValue="draft"
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
            htmlFor="backgroundImageUrl"
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Background Image URL (optional)
          </label>
          <input
            type="url"
            id="backgroundImageUrl"
            name="backgroundImageUrl"
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
            Create Form
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
    </div>
  );
}
