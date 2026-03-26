"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Select } from "@/components/ui";

export function QuestionEditForm({
  question,
  formId,
  action,
}: {
  question: any;
  formId: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [type, setType] = useState(question.type);
  const isInstruction = type === "instruction";

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="type" className="type-body-sm ui-text-primary">Type *</label>
        <Select id="type" name="type" required value={type} onChange={(e) => setType(e.target.value)}>
          <option value="text">Text</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="yesno">Yes/No</option>
          <option value="multi">Multiple choice</option>
          <option value="dropdown">Dropdown</option>
          <option value="instruction">Instruction</option>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="key" className="type-body-sm ui-text-primary">Key *</label>
        <Input type="text" id="key" name="key" defaultValue={question.key} required pattern="[a-z0-9_]+" />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="type-body-sm ui-text-primary">Title *</label>
        <textarea id="title" name="title" rows={2} defaultValue={question.title} required className="ui-input" />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="helpText" className="type-body-sm ui-text-primary">Help text (optional)</label>
        <textarea id="helpText" name="helpText" rows={3} defaultValue={question.helpText || ""} className="ui-input" />
      </div>

      {!isInstruction && (
        <label className="type-body-sm ui-text-primary inline-flex items-center gap-2">
          <input type="checkbox" id="required" name="required" defaultChecked={question.required} />
          Required
        </label>
      )}
      {isInstruction && <input type="hidden" name="required" value="" />}

      <div className="mt-2 flex gap-3">
        <Button type="submit">Save changes</Button>
        <Link href={`/admin/qanda/forms/${formId}`} className="no-underline">
          <Button variant="ghost">Cancel</Button>
        </Link>
      </div>
    </form>
  );
}
