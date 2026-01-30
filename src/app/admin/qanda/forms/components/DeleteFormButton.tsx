"use client";

import { useState } from "react";
import { deleteForm } from "../actions";
import { useRouter } from "next/navigation";

export function DeleteFormButton({
  formId,
  formName,
}: {
  formId: string;
  formName: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteForm(formId);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to delete form");
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "0.9rem",
            color: "#666",
          }}
        >
          Delete "{formName}"?
        </span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "0.9rem",
            cursor: isDeleting ? "not-allowed" : "pointer",
            opacity: isDeleting ? 0.6 : 1,
          }}
        >
          {isDeleting ? "Deleting..." : "Confirm"}
        </button>
        <button
          onClick={() => {
            setShowConfirm(false);
            setIsDeleting(false);
          }}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#f0f0f0",
            color: "#000",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      style={{
        padding: "0.5rem 1rem",
        backgroundColor: "#dc2626",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        fontSize: "0.9rem",
        cursor: "pointer",
      }}
    >
      Delete
    </button>
  );
}
