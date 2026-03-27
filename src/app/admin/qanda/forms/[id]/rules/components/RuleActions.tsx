"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { deleteRule, moveRule } from "../actions";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

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
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to move rule"));
      setIsMoving(false);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleMove} disabled={disabled || isMoving}>
      {direction === "up" ? "↑" : "↓"}
    </Button>
  );
}

export function DeleteRuleButton({
  ruleId,
  formId,
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
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to delete rule"));
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="type-meta-sm ui-text-secondary">Delete rule?</span>
        <Button onClick={handleDelete} disabled={isDeleting} className="bg-[var(--danger-fg)] text-[var(--bg-app)]">
          {isDeleting ? "Deleting..." : "Confirm"}
        </Button>
        <Button variant="ghost" onClick={() => { setShowConfirm(false); setIsDeleting(false); }}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleDelete} className="bg-[var(--danger-fg)] text-[var(--bg-app)]">
      Delete
    </Button>
  );
}
