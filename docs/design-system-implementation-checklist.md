# QandA Design System Implementation Checklist

This checklist maps the design system spec to concrete implementation steps in the current codebase.
Use it as the execution order to minimize regressions.

## Phase 1 - Foundation Tokens and Fonts

## 1.1 Replace global visual foundation

- [ ] Update `src/app/globals.css` to remove legacy "liquid glass" token set and define QandA tokens from `docs/design-system-spec.md`.
- [ ] Define neutral layers, text, borders, semantic tokens, spacing, radius, and motion tokens.
- [ ] Add form accent variables: `--accent`, `--accent-contrast`.
- [ ] Keep token names stable and avoid hardcoded hex in feature pages.

## 1.2 Font foundation

- [ ] In `src/app/layout.tsx`, load Syne + DM Sans with `next/font/google`.
- [ ] Expose font variables in `<body>` className and connect them to global utility classes.
- [ ] Make DM Sans default body font and Syne opt-in for structural typography utilities.

## 1.3 Base utility layer

- [ ] Add reusable classes in `src/app/globals.css`:
  - [ ] Typography (`.type-display-md`, `.type-heading-md`, `.type-body-md`, `.type-label-sm`, etc.).
  - [ ] Surfaces (`.ui-surface-nav`, `.ui-surface-panel`, `.ui-surface-field`).
  - [ ] Borders/radius (`.ui-border`, `.ui-radius-md`, `.ui-radius-lg`).
  - [ ] Text roles (`.ui-text-primary`, `.ui-text-secondary`, `.ui-text-muted`).

## Phase 2 - Shared Primitives (No Page Redesign Yet)

Create a single primitives module before touching all pages.

## 2.1 New primitives files

- [ ] Add `src/components/ui/Button.tsx`
- [ ] Add `src/components/ui/Input.tsx`
- [ ] Add `src/components/ui/Select.tsx`
- [ ] Add `src/components/ui/Card.tsx`
- [ ] Add `src/components/ui/Badge.tsx`
- [ ] Add `src/components/ui/Tabs.tsx` (if current pages need tab semantics)

## 2.2 Primitive behavior contract

- [ ] Each primitive supports `default`, `hover`, `active`, `focus-visible`, `disabled`.
- [ ] Focus-visible uses tokenized ring behavior.
- [ ] Primary button uses neutral admin style; accent variant allowed only for form-facing screens.
- [ ] No component includes hardcoded one-off colors.

## Phase 3 - Admin Shell Migration

## 3.1 Admin layout frame

- [ ] Refactor `src/app/admin/layout.tsx`:
  - [ ] Replace inline styles with utility/primitives.
  - [ ] Sidebar width to `196px`, top structure aligned to spec.
  - [ ] Update label from `Q&A`/`Qanda` to `QandA`.

## 3.2 Admin landing and section headers

- [ ] Refactor `src/app/admin/qanda/page.tsx` to use new typography and surfaces.
- [ ] Ensure section labels use Syne structural style and helper text uses DM Sans.

## Phase 4 - Forms Admin Flows

Apply primitives to CRUD flow screens first, then deeper editors.

## 4.1 Form list and form detail

- [ ] `src/app/admin/qanda/forms/page.tsx`
- [ ] `src/app/admin/qanda/forms/new/page.tsx`
- [ ] `src/app/admin/qanda/forms/[id]/page.tsx`
- [ ] Replace inline style blocks with `Card`, `Badge`, `Button`, `Input`, `Select`.
- [ ] Normalize heading scale and muted metadata usage.

## 4.2 Question flow screens

- [ ] `src/app/admin/qanda/forms/[id]/questions/new/page.tsx`
- [ ] `src/app/admin/qanda/forms/[id]/questions/[questionId]/page.tsx`
- [ ] `src/app/admin/qanda/forms/[id]/questions/new/components/QuestionForm.tsx`
- [ ] `src/app/admin/qanda/forms/[id]/questions/[questionId]/components/QuestionEditForm.tsx`
- [ ] `src/app/admin/qanda/forms/[id]/questions/[questionId]/components/ChoiceManager.tsx`
- [ ] `src/app/admin/qanda/forms/[id]/questions/components/QuestionActions.tsx`
- [ ] `src/app/admin/qanda/forms/[id]/questions/[questionId]/components/DeleteQuestionButton.tsx`

## 4.3 Rules and submissions screens

- [ ] `src/app/admin/qanda/forms/[id]/rules/page.tsx`
- [ ] `src/app/admin/qanda/forms/[id]/rules/[ruleId]/edit/page.tsx`
- [ ] `src/app/admin/qanda/forms/[id]/rules/components/RuleForm.tsx`
- [ ] `src/app/admin/qanda/forms/[id]/rules/components/RuleActions.tsx`
- [ ] `src/app/admin/qanda/submissions/page.tsx`
- [ ] `src/app/admin/qanda/submissions/components/FormFilter.tsx`
- [ ] `src/app/admin/qanda/submissions/[submissionId]/page.tsx`

## Phase 5 - Form-Facing Runner Migration

## 5.1 Runner page style conversion

- [ ] Refactor `src/app/forms/[slug]/page.tsx`:
  - [ ] Remove `glass-*` class dependence.
  - [ ] Use QandA surface/input/button primitives and type utilities.
  - [ ] Keep dynamic accent application only on accent-owned UI elements.
  - [ ] Keep body copy legibility with DM Sans defaults.

## 5.2 Accent variable plumbing

- [ ] Add form accent source in runner state and set CSS variable at page root.
- [ ] Compute and apply `--accent-contrast` for text/icon clarity on accent backgrounds.

## Phase 6 - Cleanup and Enforcement

## 6.1 Remove deprecated classes

- [ ] Delete unused legacy global classes in `src/app/globals.css` after all migrations.
- [ ] Ensure no `glass-*` classes remain in active pages.

## 6.2 Naming and consistency pass

- [ ] Replace inconsistent text references (`Q&A`, `Qanda`) with `QandA` where product naming is intended.
- [ ] Keep functional route/path labels unchanged unless product copy explicitly requires display labels.

## 6.3 Static checks

- [ ] Search for inline hardcoded hex values in UI files and replace with tokens.
- [ ] Verify focus-visible state exists on all keyboard-interactive controls.

## Validation Checklist (Definition of Done)

- [ ] All primary admin UI screens use tokenized surfaces and typography roles.
- [ ] Shared UI primitives are used instead of repeated inline style objects.
- [ ] Runner uses accent only for approved accent surfaces.
- [ ] No legacy liquid-glass classes remain in production paths.
- [ ] Product naming is consistently `QandA`.
- [ ] Lint passes for touched files.

## Suggested Execution Slices

If implementing across multiple PRs, split as:

1. **PR 1:** Tokens + fonts + primitives
2. **PR 2:** Admin shell + forms list/detail
3. **PR 3:** Questions/rules/submissions screens
4. **PR 4:** Form runner + accent contract + cleanup
