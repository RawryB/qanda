"use client";

import { useState } from "react";
import { moveRule, deleteRule } from "../actions";
import { useRouter } from "next/navigation";

export function MoveRuleButton({
  formId,
  ruleId,
  direction,
  disabled,
}: {
  formId: string;
  ruleId: string;
  direction: "up" | "down";
  disabled: boolean;
}) {
  const [isMoving, setIsMoving] = useState(false);
  const router = useRouter();

  const handleMove = async () => {
    setIsMoving(true);
    try {
      await moveRule(formId, ruleId, direction);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to move rule");
      setIsMoving(false);
    }
  };

  return (
    <button
      onClick={handleMove}
      disabled={disabled || isMoving}
      style={{
        padding: "0.5rem 0.75rem",
        border: "1px solid #ccc",
        borderRadius: "4px",
        backgroundColor: "#fff",
        color: "#000",
        cursor: disabled || isMoving ? "not-allowed" : "pointer",
        opacity: disabled || isMoving ? 0.6 : 1,
        fontSize: "1rem",
        fontWeight: "bold",
        minWidth: "2rem",
      }}
      title={direction === "up" ? "Move up (higher priority)" : "Move down (lower priority)"}
    >
      {direction === "up" ? "↑" : "↓"}
    </button>
  );
}

export function DeleteRuleButton({
  ruleId,
  formId,
  ruleDescription,
}: {
  ruleId: string;
  formId: string;
  ruleDescription: string;
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
      await deleteRule(ruleId, formId);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to delete rule");
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
          Delete rule?
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
