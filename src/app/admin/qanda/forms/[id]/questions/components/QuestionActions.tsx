"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { deleteQuestion, moveQuestion } from "../actions";

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
    <Button variant="ghost" size="sm" onClick={handleMove} disabled={disabled || isMoving} title={direction === "up" ? "Move up" : "Move down"}>
      {direction === "up" ? "↑" : "↓"}
    </Button>
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
      <div className="flex items-center gap-2">
        <span className="type-meta-sm ui-text-secondary">Delete "{questionTitle}"?</span>
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
