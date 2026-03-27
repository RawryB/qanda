"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Select } from "@/components/ui";
import { updateForm } from "../../actions";
import { createRule } from "../rules/actions";
import { DeleteRuleButton, MoveRuleButton } from "../rules/components/RuleActions";
import { RuleForm } from "../rules/components/RuleForm";
import {
  createQuestion,
  deleteQuestion,
  reorderQuestion,
  updateQuestion,
} from "../questions/actions";
import { ChoiceManager } from "../questions/[questionId]/components/ChoiceManager";

type Question = {
  id: string;
  order: number;
  type: string;
  key: string;
  title: string;
  helpText: string | null;
  required: boolean;
  choices: Array<{ id: string; order: number; value: string; label: string }>;
};

type FormData = {
  id: string;
  name: string;
  slug: string;
  status: string;
  primaryColor: string;
  accentColor: string;
  transitionColor: string | null;
  primaryFont: string;
  secondaryFont: string;
  logoUrl: string | null;
  redirectUrl: string | null;
  zapierHookUrl: string | null;
  backgroundImageUrl: string | null;
  introText: string | null;
  completionTitle: string | null;
  completionMessage: string | null;
};

export function FormEditorWorkspace({
  form,
  questions,
  rules,
}: {
  form: FormData;
  questions: Question[];
  rules: Array<{
    id: string;
    sourceQuestionId: string;
    operator: string;
    compareValue: string | null;
    destinationQuestionId: string | null;
    isEnd: boolean;
    priority: number;
    sourceQuestion: {
      id: string;
      title: string;
      key: string;
      order: number;
    };
  }>;
}) {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<"settings" | "questions" | "logic" | "branding">(
    "settings",
  );
  const [questionEditorMode, setQuestionEditorMode] = useState<"edit" | "create">(
    "edit",
  );
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    questions[0]?.id ?? null,
  );
  const [createQuestionType, setCreateQuestionType] = useState("text");
  const [editQuestionType, setEditQuestionType] = useState<string>("text");
  const [draggingQuestionId, setDraggingQuestionId] = useState<string | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const selectedQuestion = useMemo(
    () => questions.find((q) => q.id === selectedQuestionId) ?? null,
    [questions, selectedQuestionId],
  );

  useEffect(() => {
    if (selectedQuestion) {
      setEditQuestionType(selectedQuestion.type);
    }
  }, [selectedQuestion?.id, selectedQuestion?.type]);

  const questionTypes = [
    { value: "text", label: "Text", icon: "T" },
    { value: "email", label: "Email", icon: "@" },
    { value: "phone", label: "Phone", icon: "☎" },
    { value: "yesno", label: "Yes/No", icon: "✓" },
    { value: "multi", label: "Multiple Choice", icon: "◉" },
    { value: "dropdown", label: "Dropdown", icon: "▾" },
    { value: "instruction", label: "Instruction", icon: "i" },
  ] as const;

  const googleFontOptions = [
    "Syne",
    "DM Sans",
    "Inter",
    "Lora",
    "Merriweather",
    "Montserrat",
    "Poppins",
    "Manrope",
    "Plus Jakarta Sans",
    "Playfair Display",
  ] as const;

  const handleFormSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new window.FormData(e.currentTarget);
    startTransition(async () => {
      await updateForm(form.id, fd);
      router.refresh();
    });
  };

  const handleQuestionSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedQuestion) return;
    const fd = new window.FormData(e.currentTarget);
    startTransition(async () => {
      await updateQuestion(selectedQuestion.id, fd);
      router.refresh();
    });
  };

  const handleQuestionCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new window.FormData(e.currentTarget);
    startTransition(async () => {
      await createQuestion(form.id, fd);
      setQuestionEditorMode("edit");
      router.refresh();
    });
  };

  const handleCreateRule = async (formData: FormData) => {
    await createRule(form.id, formData);
  };

  const handleDropOnQuestion = (target: Question) => {
    if (!draggingQuestionId || draggingQuestionId === target.id) return;
    startTransition(async () => {
      await reorderQuestion(form.id, draggingQuestionId, target.order);
      setDraggingQuestionId(null);
      router.refresh();
    });
  };

  const handleDeleteQuestion = () => {
    if (!selectedQuestion) return;
    if (!confirm(`Delete "${selectedQuestion.title}"?`)) return;
    startTransition(async () => {
      await deleteQuestion(selectedQuestion.id);
      setSelectedQuestionId(null);
      router.refresh();
    });
  };

  return (
    <div className="ui-surface-panel ui-border ui-radius-lg overflow-hidden">
      <div className="flex min-h-[760px] flex-col">
        <div className="ui-surface-nav flex h-[52px] items-center gap-3 border-b border-[var(--border-subtle)] px-5">
          <Link
            href="/admin/qanda/forms"
            className="type-label-sm ui-text-muted no-underline hover:ui-text-primary"
          >
            Forms
          </Link>
          <div className="h-5 w-px bg-[var(--border-subtle)]" />
          <Input
            defaultValue={form.name}
            readOnly
            className="border-none bg-transparent px-0 py-0 font-[var(--font-syne)] text-[14px] font-bold shadow-none focus-visible:ring-0"
          />
          <span className="type-label-sm ui-text-tertiary">
            {isPending ? "Saving..." : "Saved"}
          </span>
          <a
            href={`/forms/${form.slug}?preview=1`}
            target="_blank"
            rel="noreferrer"
            className="no-underline"
          >
            <Button variant="ghost" size="sm">
              Preview
            </Button>
          </a>
        </div>

        <div className="ui-surface-nav flex h-10 items-center gap-1 border-b border-[var(--border-subtle)] px-5">
          <button
            type="button"
            onClick={() => setActivePanel("questions")}
            className={`type-label-sm rounded-[5px] px-3 py-1 ${
              activePanel === "questions"
                ? "border border-[var(--border-subtle)] bg-[var(--bg-field)] ui-text-primary"
                : "ui-text-muted"
            }`}
          >
            Questions
          </button>
          <button
            type="button"
            onClick={() => setActivePanel("logic")}
            className={`type-label-sm rounded-[5px] px-3 py-1 ${
              activePanel === "logic"
                ? "border border-[var(--border-subtle)] bg-[var(--bg-field)] ui-text-primary"
                : "ui-text-muted"
            }`}
          >
            Logic
          </button>
          <button
            type="button"
            onClick={() => setActivePanel("branding")}
            className={`type-label-sm rounded-[5px] px-3 py-1 ${
              activePanel === "branding"
                ? "border border-[var(--border-subtle)] bg-[var(--bg-field)] ui-text-primary"
                : "ui-text-muted"
            }`}
          >
            Branding
          </button>
          <button
            type="button"
            onClick={() => setActivePanel("settings")}
            className={`type-label-sm rounded-[5px] px-3 py-1 ${
              activePanel === "settings"
                ? "border border-[var(--border-subtle)] bg-[var(--bg-field)] ui-text-primary"
                : "ui-text-muted"
            }`}
          >
            Settings
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <aside className="ui-surface-nav w-[280px] border-r border-[var(--border-subtle)]">
            <div className="flex items-center justify-between px-4 pb-2 pt-4">
              <div className="type-label-sm uppercase tracking-[0.12em] ui-text-tertiary">Questions</div>
              <div className="type-label-sm ui-text-tertiary">{questions.length}</div>
            </div>
            <div className="max-h-[520px] overflow-y-auto p-2">
              {questions.length === 0 ? (
                <p className="type-body-sm ui-text-secondary p-2">No questions yet.</p>
              ) : (
                questions.map((question, idx) => (
                  <button
                    key={question.id}
                    type="button"
                    draggable
                    onDragStart={() => setDraggingQuestionId(question.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDropOnQuestion(question)}
                    onClick={() => {
                      setSelectedQuestionId(question.id);
                      setQuestionEditorMode("edit");
                      setActivePanel("questions");
                    }}
                    className={`mb-2 flex w-full items-start gap-2 rounded-[8px] border p-3 text-left ${
                      selectedQuestionId === question.id
                        ? "border-[var(--text-primary)] bg-[var(--bg-panel)]"
                        : "border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--text-muted)]"
                    }`}
                  >
                    <span className="type-label-sm ui-text-tertiary min-w-4">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <div className="type-body-sm ui-text-primary line-clamp-2">{question.title}</div>
                      <div className="type-label-sm ui-text-tertiary uppercase">{question.type}</div>
                    </div>
                    <span className="ui-text-tertiary">⠿</span>
                  </button>
                ))
              )}
            </div>
            <div className="p-2">
              <button
                type="button"
                onClick={() => {
                  setActivePanel("questions");
                  setQuestionEditorMode("create");
                  setSelectedQuestionId(null);
                }}
                className="type-label-sm flex w-full items-center justify-center gap-2 rounded-[8px] border border-dashed border-[var(--border-subtle)] px-3 py-2 ui-text-muted hover:ui-text-secondary"
              >
                <span>+</span>
                Add question
              </button>
            </div>
          </aside>

          <div className="flex-1 overflow-y-auto p-6">
            {activePanel === "settings" ? (
              <Card key="settings-panel" className="mb-4 p-4">
                <div className="type-label-sm mb-2 uppercase tracking-[0.12em] ui-text-tertiary">
                  Form settings
                </div>
                <form key="settings-form" onSubmit={handleFormSave} className="grid gap-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="name" className="type-body-sm ui-text-primary">Name *</label>
                      <Input id="name" name="name" defaultValue={form.name} required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="slug" className="type-body-sm ui-text-primary">Slug *</label>
                      <Input id="slug" name="slug" defaultValue={form.slug} required pattern="[a-z0-9-]+" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="status" className="type-body-sm ui-text-primary">Status</label>
                      <Select id="status" name="status" defaultValue={form.status}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="redirectUrl" className="type-body-sm ui-text-primary">Redirect URL</label>
                      <Input id="redirectUrl" name="redirectUrl" type="url" defaultValue={form.redirectUrl || ""} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="zapierHookUrl" className="type-body-sm ui-text-primary">Zapier hook URL</label>
                      <Input id="zapierHookUrl" name="zapierHookUrl" type="url" defaultValue={form.zapierHookUrl || ""} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="introText" className="type-body-sm ui-text-primary">Intro text</label>
                    <textarea id="introText" name="introText" rows={3} defaultValue={form.introText || ""} className="ui-input" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="completionTitle" className="type-body-sm ui-text-primary">Completion title</label>
                      <Input id="completionTitle" name="completionTitle" defaultValue={form.completionTitle || ""} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="completionMessage" className="type-body-sm ui-text-primary">Completion message</label>
                      <textarea id="completionMessage" name="completionMessage" rows={3} defaultValue={form.completionMessage || ""} className="ui-input" />
                    </div>
                  </div>
                  <div>
                    <Button type="submit" size="sm" disabled={isPending}>Save form</Button>
                  </div>
                </form>
              </Card>
            ) : activePanel === "questions" ? (
              <Card key={`question-panel-${selectedQuestion?.id ?? "none"}`} className="p-4">
                <div className="type-label-sm mb-2 uppercase tracking-[0.12em] ui-text-tertiary">
                  Question editor
                </div>
                {questionEditorMode === "create" ? (
                  <form key="question-create-form" onSubmit={handleQuestionCreate} className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="type-body-sm ui-text-primary">Type</label>
                      <input type="hidden" name="type" value={createQuestionType} />
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        {questionTypes.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setCreateQuestionType(type.value)}
                            className={`rounded-[8px] border px-3 py-2 text-center ${
                              createQuestionType === type.value
                                ? "border-[var(--text-primary)] bg-[var(--bg-field)]"
                                : "border-[var(--border-subtle)] bg-[var(--bg-panel)]"
                            }`}
                          >
                            <div className="mb-1 text-[16px] leading-none ui-text-secondary">{type.icon}</div>
                            <div className="type-label-sm ui-text-secondary">{type.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="q-create-key" className="type-body-sm ui-text-primary">Key</label>
                        <Input id="q-create-key" name="key" pattern="[a-z0-9_]+" required />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="q-create-title" className="type-body-sm ui-text-primary">Question text</label>
                      <textarea id="q-create-title" name="title" rows={2} className="ui-input" required />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="q-create-help" className="type-body-sm ui-text-primary">Help text</label>
                      <textarea id="q-create-help" name="helpText" rows={2} className="ui-input" />
                    </div>
                    {createQuestionType === "instruction" ? (
                      <input type="hidden" name="required" value="" />
                    ) : (
                      <label className="type-body-sm ui-text-primary inline-flex items-center gap-2">
                        <input type="checkbox" name="required" />
                        Required
                      </label>
                    )}
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={isPending}>Create question</Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setQuestionEditorMode("edit");
                          setSelectedQuestionId(questions[0]?.id ?? null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : !selectedQuestion ? (
                  <p className="type-body-sm ui-text-secondary">Select a question on the left to edit.</p>
                ) : (
                  <>
                    <form
                      key={`question-form-${selectedQuestion.id}`}
                      onSubmit={handleQuestionSave}
                      className="grid gap-4"
                    >
                    <div className="grid gap-2">
                      <label className="type-body-sm ui-text-primary">Type</label>
                      <input type="hidden" name="type" value={editQuestionType} />
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        {questionTypes.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setEditQuestionType(type.value)}
                            className={`rounded-[8px] border px-3 py-2 text-center ${
                              editQuestionType === type.value
                                ? "border-[var(--text-primary)] bg-[var(--bg-field)]"
                                : "border-[var(--border-subtle)] bg-[var(--bg-panel)]"
                            }`}
                          >
                            <div className="mb-1 text-[16px] leading-none ui-text-secondary">{type.icon}</div>
                            <div className="type-label-sm ui-text-secondary">{type.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <label htmlFor="q-key" className="type-body-sm ui-text-primary">Key</label>
                          <Input id="q-key" name="key" defaultValue={selectedQuestion.key} pattern="[a-z0-9_]+" required />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="q-title" className="type-body-sm ui-text-primary">Question text</label>
                        <textarea id="q-title" name="title" rows={2} defaultValue={selectedQuestion.title} className="ui-input" required />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="q-help" className="type-body-sm ui-text-primary">Help text</label>
                        <textarea id="q-help" name="helpText" rows={2} defaultValue={selectedQuestion.helpText || ""} className="ui-input" />
                      </div>
                    {editQuestionType === "instruction" ? (
                      <input type="hidden" name="required" value="" />
                    ) : (
                      <label className="type-body-sm ui-text-primary inline-flex items-center gap-2">
                        <input type="checkbox" name="required" defaultChecked={selectedQuestion.required} />
                        Required
                      </label>
                    )}
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={isPending}>Save question</Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-[var(--danger-fg)]"
                          onClick={handleDeleteQuestion}
                          disabled={isPending}
                        >
                          Delete question
                        </Button>
                      </div>
                    </form>

                    {(editQuestionType === "multi" ||
                      editQuestionType === "dropdown") && (
                      <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
                        <ChoiceManager
                          questionId={selectedQuestion.id}
                          choices={selectedQuestion.choices || []}
                        />
                      </div>
                    )}
                  </>
                )}
              </Card>
            ) : activePanel === "logic" ? (
              <div className="grid gap-4">
                <Card className="p-4">
                  <div className="type-label-sm mb-2 uppercase tracking-[0.12em] ui-text-tertiary">
                    Add rule
                  </div>
                  <RuleForm formId={form.id} questions={questions} action={handleCreateRule} />
                </Card>

                <Card className="p-4">
                  <div className="type-label-sm mb-2 uppercase tracking-[0.12em] ui-text-tertiary">
                    Existing rules
                  </div>
                  {rules.length === 0 ? (
                    <p className="type-body-sm ui-text-secondary">No rules yet.</p>
                  ) : (
                    <div className="grid gap-3">
                      {rules.map((rule) => {
                        const destinationQuestion = rule.destinationQuestionId
                          ? questions.find((q) => q.id === rule.destinationQuestionId)
                          : null;
                        const sourceRulesSorted = rules
                          .filter((r) => r.sourceQuestionId === rule.sourceQuestionId)
                          .sort((a, b) => a.priority - b.priority);
                        const idx = sourceRulesSorted.findIndex((r) => r.id === rule.id);
                        return (
                          <div
                            key={rule.id}
                            className="ui-surface-field ui-border ui-radius-md flex items-start justify-between gap-3 p-3"
                          >
                            <div className="type-body-sm">
                              <div>
                                <strong>{rule.sourceQuestion.title}</strong> ({rule.sourceQuestion.key})
                              </div>
                              <div className="ui-text-secondary">
                                {rule.operator}
                                {rule.compareValue ? ` ${rule.compareValue}` : ""}
                              </div>
                              <div className="ui-text-secondary">
                                Then:{" "}
                                {rule.isEnd ? "End form" : destinationQuestion ? destinationQuestion.title : "Invalid destination"}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <MoveRuleButton
                                formId={form.id}
                                ruleId={rule.id}
                                direction="up"
                                disabled={idx <= 0}
                              />
                              <MoveRuleButton
                                formId={form.id}
                                ruleId={rule.id}
                                direction="down"
                                disabled={idx >= sourceRulesSorted.length - 1}
                              />
                              <DeleteRuleButton
                                formId={form.id}
                                ruleId={rule.id}
                                ruleDescription={rule.sourceQuestion.title}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>
            ) : (
              <Card className="p-4">
                <div className="type-label-sm mb-2 uppercase tracking-[0.12em] ui-text-tertiary">
                  Branding
                </div>
                <form onSubmit={handleFormSave} className="grid gap-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="primaryColor" className="type-body-sm ui-text-primary">Primary color (hex)</label>
                      <Input id="primaryColor" name="primaryColor" defaultValue={form.primaryColor} required pattern="^#[0-9a-fA-F]{6}$" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="accentColor" className="type-body-sm ui-text-primary">Accent color (hex)</label>
                      <Input id="accentColor" name="accentColor" defaultValue={form.accentColor} required pattern="^#[0-9a-fA-F]{6}$" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="transitionColor" className="type-body-sm ui-text-primary">Transition color (hex, optional)</label>
                      <Input id="transitionColor" name="transitionColor" defaultValue={form.transitionColor || ""} pattern="^#[0-9a-fA-F]{6}$" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="logoUrl" className="type-body-sm ui-text-primary">Logo PNG URL</label>
                      <Input id="logoUrl" name="logoUrl" defaultValue={form.logoUrl || ""} placeholder="https://.../logo.png" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="backgroundImageUrl" className="type-body-sm ui-text-primary">Background image URL</label>
                      <Input id="backgroundImageUrl" name="backgroundImageUrl" type="url" defaultValue={form.backgroundImageUrl || ""} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="primaryFont" className="type-body-sm ui-text-primary">Primary font</label>
                      <Select id="primaryFont" name="primaryFont" defaultValue={form.primaryFont}>
                        {googleFontOptions.map((font) => (
                          <option key={font} value={font}>
                            {font}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="secondaryFont" className="type-body-sm ui-text-primary">Secondary font</label>
                      <Select id="secondaryFont" name="secondaryFont" defaultValue={form.secondaryFont}>
                        {googleFontOptions.map((font) => (
                          <option key={font} value={font}>
                            {font}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Button type="submit" size="sm" disabled={isPending}>Save branding</Button>
                  </div>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
