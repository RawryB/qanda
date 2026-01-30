"use client";

import { useState } from "react";
import { moveQuestion, deleteQuestion } from "../actions";
import { useRouter } from "next/navigation";

export function MoveQuestionButton({
  formId,
  questionId,
  direction,
  disabled,
}: {
  formId: string;
  questionId: string;
  direction: "up" | "down";
  disabled: boolean;
}) {
  const [isMoving, setIsMoving] = useState(false);
  const router = useRouter();

  const handleMove = async () => {
    setIsMoving(true);
    try {
      await moveQuestion(formId, questionId, direction);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to move question");
      setIsMoving(false);
    }
  };

  return (
    <button
      onClick={handleMove}
      disabled={disabled || isMoving}
      style={{
        padding: "0.5rem",
        border: "1px solid #ccc",
        borderRadius: "4px",
        backgroundColor: "#fff",
        cursor: disabled || isMoving ? "not-allowed" : "pointer",
        opacity: disabled || isMoving ? 0.6 : 1,
        fontSize: "0.9rem",
      }}
      title={direction === "up" ? "Move up" : "Move down"}
    >
      {direction === "up" ? "↑" : "↓"}
    </button>
  );
}

export function DeleteQuestionButton({
  questionId,
  questionTitle,
}: {
  questionId: string;
  questionTitle: string;
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
      await deleteQuestion(questionId);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to delete question");
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
          Delete "{questionTitle}"?
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
