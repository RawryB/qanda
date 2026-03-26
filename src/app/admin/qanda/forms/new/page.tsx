import Link from "next/link";
import { createForm } from "../actions";
import { Button, Card, Input, Select } from "@/components/ui";

export default function NewFormPage() {
  return (
    <div className="flex max-w-[700px] flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="type-display-md m-0">New form</h1>
        <Link href="/admin/qanda/forms" className="type-body-sm ui-text-secondary">
          Back to forms
        </Link>
      </div>

      <Card className="p-6">
        <form action={createForm} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="type-body-sm ui-text-primary">
              Name <span className="text-[var(--danger-fg)]">*</span>
            </label>
            <Input type="text" id="name" name="name" required />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="slug" className="type-body-sm ui-text-primary">
              Slug <span className="text-[var(--danger-fg)]">*</span>
            </label>
            <Input type="text" id="slug" name="slug" required pattern="[a-z0-9-]+" />
            <small className="type-meta-sm ui-text-muted">
              Lowercase letters, numbers, and hyphens only. No spaces.
            </small>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="status" className="type-body-sm ui-text-primary">
              Status
            </label>
            <Select id="status" name="status" defaultValue="draft">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="redirectUrl" className="type-body-sm ui-text-primary">
              Redirect URL (optional)
            </label>
            <Input type="url" id="redirectUrl" name="redirectUrl" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="zapierHookUrl" className="type-body-sm ui-text-primary">
              Zapier Hook URL (optional)
            </label>
            <Input type="url" id="zapierHookUrl" name="zapierHookUrl" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="backgroundImageUrl" className="type-body-sm ui-text-primary">
              Background Image URL (optional)
            </label>
            <Input type="url" id="backgroundImageUrl" name="backgroundImageUrl" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="introText" className="type-body-sm ui-text-primary">
              Intro Text (optional)
            </label>
            <textarea id="introText" name="introText" className="ui-input min-h-[96px]" rows={4} />
            <small className="type-meta-sm ui-text-muted">
              Shown on the first screen before the applicant starts the form.
            </small>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="completionTitle" className="type-body-sm ui-text-primary">
              Completion Title (optional)
            </label>
            <Input type="text" id="completionTitle" name="completionTitle" placeholder="Done" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="completionMessage" className="type-body-sm ui-text-primary">
              Completion Message (optional)
            </label>
            <textarea
              id="completionMessage"
              name="completionMessage"
              className="ui-input min-h-[84px]"
              rows={3}
              placeholder="Thank you for your submission!"
            />
          </div>

          <div className="mt-2 flex gap-3">
            <Button type="submit">Create form</Button>
            <Link href="/admin/qanda/forms" className="no-underline">
              <Button variant="ghost">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
