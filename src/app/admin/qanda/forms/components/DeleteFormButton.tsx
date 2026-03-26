"use client";

import { useState } from "react";
import { deleteForm } from "../actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

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
      <div className="flex items-center gap-1">
        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          size="sm"
          className="bg-[var(--danger-fg)] px-2 text-[var(--bg-app)]"
          title={`Confirm delete ${formName}`}
        >
          {isDeleting ? "…" : "✓"}
        </Button>
        <Button
          onClick={() => {
            setShowConfirm(false);
            setIsDeleting(false);
          }}
          variant="ghost"
          size="sm"
          className="px-2"
          title="Cancel delete"
        >
          ✕
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleDelete}
      variant="ghost"
      size="sm"
      className="px-2 text-[var(--danger-fg)]"
      title={`Delete ${formName}`}
    >
      🗑
    </Button>
  );
}
