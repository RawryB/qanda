"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export function QuestionForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const params = useParams();
  const id = params.id as string;
  const [type, setType] = useState("text");

  const isInstruction = type === "instruction";

  return (
    <form
      action={action}
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
          required
          value={type}
          onChange={(e) => setType(e.target.value)}
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
          <option value="instruction">Instruction</option>
        </select>
        <small
          style={{
            fontSize: "0.8rem",
            color: "#666",
            fontStyle: "italic",
          }}
        >
          Note: For Multiple Choice and Dropdown questions, you'll be able to add choices after creating the question.
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
        <textarea
          id="title"
          name="title"
          rows={2}
          required
          style={{
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "1rem",
            resize: "vertical",
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
          style={{
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "1rem",
          }}
        />
      </div>

      {!isInstruction && (
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
      )}
      {isInstruction && <input type="hidden" name="required" value="" />}

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
          Create Question
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
      </div>
    </form>
  );
}
