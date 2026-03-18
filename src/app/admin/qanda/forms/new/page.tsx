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
        <h1 className="gradient-text" style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>
          New Form
        </h1>
        <Link
          href="/admin/qanda/forms"
          className="text-secondary"
          style={{
            textDecoration: "underline",
            fontSize: "0.9rem",
          }}
        >
          Back to forms
        </Link>
      </div>

      <form
        action={createForm}
        className="glass-card fade-in-up"
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
            className="text-primary"
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Name <span style={{ color: "#f5576c" }}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="glass-input"
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
            className="text-primary"
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Slug <span style={{ color: "#f5576c" }}>*</span>
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            required
            pattern="[a-z0-9-]+"
            className="glass-input"
          />
          <small className="text-muted" style={{ fontSize: "0.8rem" }}>
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
            className="text-primary"
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
            className="glass-select"
          >
            <option value="draft" style={{ background: "#1e3a8a", color: "white" }}>Draft</option>
            <option value="published" style={{ background: "#1e3a8a", color: "white" }}>Published</option>
            <option value="archived" style={{ background: "#1e3a8a", color: "white" }}>Archived</option>
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
            className="text-primary"
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
            className="glass-input"
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
            className="text-primary"
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
            className="glass-input"
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
            className="text-primary"
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
            className="glass-input"
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
            htmlFor="introText"
            className="text-primary"
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Intro Text (optional)
          </label>
          <textarea
            id="introText"
            name="introText"
            className="glass-input"
            rows={4}
          />
          <small className="text-muted" style={{ fontSize: "0.8rem" }}>
            Shown on the first screen before the applicant starts the form.
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
            htmlFor="completionTitle"
            className="text-primary"
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Completion Title (optional)
          </label>
          <input
            type="text"
            id="completionTitle"
            name="completionTitle"
            className="glass-input"
            placeholder="Done"
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
            htmlFor="completionMessage"
            className="text-primary"
            style={{
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Completion Message (optional)
          </label>
          <textarea
            id="completionMessage"
            name="completionMessage"
            className="glass-input"
            rows={3}
            placeholder="Thank you for your submission!"
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
            className="btn-glass btn-glass-primary liquid-shine"
          >
            Create Form
          </button>
          <Link
            href="/admin/qanda/forms"
            className="btn-glass btn-glass-outline"
            style={{
              textDecoration: "none",
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
