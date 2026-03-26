"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Card, Input, Select } from "@/components/ui";

export function QuestionForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const params = useParams();
  const id = params.id as string;
  const [type, setType] = useState("text");
  const isInstruction = type === "instruction";

  return (
    <Card className="p-6">
      <form action={action} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="type" className="type-body-sm ui-text-primary">
            Type <span className="text-[var(--danger-fg)]">*</span>
          </label>
          <Select id="type" name="type" required value={type} onChange={(e) => setType(e.target.value)}>
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="yesno">Yes/No</option>
            <option value="multi">Multiple choice</option>
            <option value="dropdown">Dropdown</option>
            <option value="instruction">Instruction</option>
          </Select>
          <small className="type-meta-sm ui-text-muted italic">
            For multiple choice and dropdown questions, you can add choices after creating the question.
          </small>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="key" className="type-body-sm ui-text-primary">
            Key <span className="text-[var(--danger-fg)]">*</span>
          </label>
          <Input type="text" id="key" name="key" required pattern="[a-z0-9_]+" />
          <small className="type-meta-sm ui-text-muted">Lowercase letters, numbers, and underscores only.</small>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="type-body-sm ui-text-primary">
            Title <span className="text-[var(--danger-fg)]">*</span>
          </label>
          <textarea id="title" name="title" rows={2} required className="ui-input min-h-[64px]" />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="helpText" className="type-body-sm ui-text-primary">
            Help text (optional)
          </label>
          <textarea id="helpText" name="helpText" rows={3} className="ui-input min-h-[84px]" />
        </div>

        {!isInstruction && (
          <label className="type-body-sm ui-text-primary inline-flex items-center gap-2">
            <input type="checkbox" id="required" name="required" />
            Required
          </label>
        )}
        {isInstruction && <input type="hidden" name="required" value="" />}

        <div className="mt-2 flex gap-3">
          <Button type="submit">Create question</Button>
          <Link href={`/admin/qanda/forms/${id}`} className="no-underline">
            <Button variant="ghost">Cancel</Button>
          </Link>
        </div>
      </form>
    </Card>
  );
}
