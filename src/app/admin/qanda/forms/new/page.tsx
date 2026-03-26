import Link from "next/link";
import { Button, Card, Input, Select } from "@/components/ui";
import { createForm } from "../actions";

export default function NewFormPage() {
  return (
    <div className="ui-surface-panel ui-border ui-radius-lg overflow-hidden">
      <form action={createForm} className="flex min-h-[760px] flex-col">
        <div className="ui-surface-nav flex h-[52px] items-center gap-3 border-b border-[var(--border-subtle)] px-5">
          <Link href="/admin/qanda/forms" className="type-label-sm ui-text-muted no-underline hover:ui-text-primary">
            Forms
          </Link>
          <div className="h-5 w-px bg-[var(--border-subtle)]" />
          <Input
            name="name"
            defaultValue="Untitled form"
            required
            className="border-none bg-transparent px-0 py-0 font-[var(--font-syne)] text-[14px] font-bold shadow-none focus-visible:ring-0"
          />
          <span className="type-label-sm ui-text-tertiary">Unsaved</span>
          <a href="#" className="no-underline"><Button variant="ghost" size="sm">Preview</Button></a>
          <Button type="submit" size="sm">Create</Button>
        </div>

        <div className="ui-surface-nav flex h-10 items-center gap-1 border-b border-[var(--border-subtle)] px-5">
          <button type="button" className="type-label-sm rounded-[5px] border border-[var(--border-subtle)] bg-[var(--bg-field)] px-3 py-1 ui-text-primary">Questions</button>
          <a href="#" className="type-label-sm rounded-[5px] px-3 py-1 no-underline ui-text-muted">Logic</a>
          <a href="#" className="type-label-sm rounded-[5px] px-3 py-1 no-underline ui-text-muted">Branding</a>
          <a href="#" className="type-label-sm rounded-[5px] px-3 py-1 no-underline ui-text-muted">Settings</a>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <aside className="ui-surface-nav w-[280px] border-r border-[var(--border-subtle)] p-4">
            <div className="type-label-sm mb-2 uppercase tracking-[0.12em] ui-text-tertiary">Questions</div>
            <p className="type-body-sm ui-text-secondary mb-3">No questions yet.</p>
            <a href="#" className="block no-underline">
              <div className="type-label-sm flex items-center justify-center gap-2 rounded-[8px] border border-dashed border-[var(--border-subtle)] px-3 py-2 ui-text-muted hover:ui-text-secondary">
                <span>+</span>
                Add question
              </div>
            </a>
          </aside>

          <div className="flex-1 overflow-y-auto p-6">
            <Card className="mb-4 p-4">
              <div className="type-label-sm mb-2 uppercase tracking-[0.12em] ui-text-tertiary">Form settings</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="slug" className="type-body-sm ui-text-primary">Slug *</label>
                  <Input id="slug" name="slug" required pattern="[a-z0-9-]+" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="status" className="type-body-sm ui-text-primary">Status</label>
                  <Select id="status" name="status" defaultValue="draft">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="redirectUrl" className="type-body-sm ui-text-primary">Redirect URL</label>
                  <Input id="redirectUrl" name="redirectUrl" type="url" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="zapierHookUrl" className="type-body-sm ui-text-primary">Zapier hook URL</label>
                  <Input id="zapierHookUrl" name="zapierHookUrl" type="url" />
                </div>
              </div>
            </Card>

            <Card className="mb-4 p-4">
              <div className="type-label-sm mb-2 uppercase tracking-[0.12em] ui-text-tertiary">Content</div>
              <div className="grid gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="backgroundImageUrl" className="type-body-sm ui-text-primary">Background image URL</label>
                  <Input id="backgroundImageUrl" name="backgroundImageUrl" type="url" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="introText" className="type-body-sm ui-text-primary">Intro text</label>
                  <textarea id="introText" name="introText" rows={4} className="ui-input min-h-[96px]" />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="completionTitle" className="type-body-sm ui-text-primary">Completion title</label>
                    <Input id="completionTitle" name="completionTitle" placeholder="Done" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="completionMessage" className="type-body-sm ui-text-primary">Completion message</label>
                    <textarea id="completionMessage" name="completionMessage" rows={3} className="ui-input min-h-[84px]" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
