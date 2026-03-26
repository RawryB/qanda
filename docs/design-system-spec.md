# QandA Design System Spec (v1)

This spec defines the visual and interaction system for QandA.
It is implementation-focused and designed for the current Next.js foundation.

## 1) Brand Principles

- QandA is neutral, structured, and confidence-first.
- The product chrome stays colorless; accent belongs to each form.
- Display text is bold and deliberate; reading text is warm and easy.
- UI copy is short, direct, and utility-first.

## 2) Naming and Brand Rules

- Product name is always `QandA` (exact casing).
- Do not render as `Q&A` or `Q and A`.
- Wordmark uses Syne 800.
- Ampersand (`&`) is the only differentiated glyph in the wordmark:
  - Admin context: muted token.
  - Form-facing context: active form accent.

## 3) Typography

## Font Families

- **Display/System UI Headline:** `Syne`
- **Body/Input/Long-form UI:** `DM Sans`

## Font Weights

- Syne: `700`, `800`
- DM Sans: `400`, `500`

## Type Scale

- `display-lg`: Syne 800, 32/36
- `display-md`: Syne 800, 24/30
- `heading-lg`: Syne 700, 20/26
- `heading-md`: Syne 700, 16/22
- `label-md`: Syne 700, 13/18
- `label-sm`: Syne 700, 12/16 (uppercase where structural)
- `body-md`: DM Sans 400, 14/21
- `body-sm`: DM Sans 400, 13/19
- `meta-sm`: DM Sans 500, 12/16

Use `body-md` as the default readable size for any paragraph or helper content.

## 4) Color Tokens

All colors are tokenized. Hex values are the source of truth.

## Neutrals

- `--bg-app`: `#0D0D0D`
- `--bg-nav`: `#111111`
- `--bg-panel`: `#161616`
- `--bg-field`: `#1E1E1E`
- `--border-subtle`: `#2A2A2A`
- `--text-primary`: `#F5F2ED`
- `--text-secondary`: `#6B6760`
- `--text-muted`: `#4A4744`
- `--text-tertiary`: `#3A3A38`

## Semantic

- `--success-bg`: `#1A3320`
- `--success-fg`: `#4ADE80`
- `--danger-bg`: `#3A1F22`
- `--danger-fg`: `#FF7A8A`
- `--focus-ring`: `#F5F2ED`

## Accent (Per Form)

- `--accent`: dynamic form color
- `--accent-contrast`: auto-computed text/icon color for accent surfaces

QandA admin must not adopt a global product accent.

## 5) Layout, Spacing, and Shape

## Spacing Scale (4px base)

- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-5`: 20px
- `--space-6`: 24px
- `--space-8`: 32px

## Radius

- `--radius-sm`: 6px
- `--radius-md`: 8px
- `--radius-lg`: 10px
- `--radius-pill`: 999px

## Border

- Default border is `1px solid var(--border-subtle)`.
- Avoid heavy separators unless section boundaries require it.

## 6) Component Specifications

## App Shell

- Sidebar width: `196px`
- Top bar height: `52px`
- Sidebar and top bar use `--bg-nav`.
- Main content base uses `--bg-app`.

## Navigation Items

- Default text: `--text-secondary`
- Active state:
  - Background: `--bg-field`
  - Text/Icon: `--text-primary`
  - Radius: `--radius-sm`

## Buttons

- **Primary**
  - BG: `--text-primary`
  - FG: `--bg-app`
  - Font: Syne 700, 12/16
- **Ghost**
  - BG: transparent
  - Border: `--border-subtle`
  - FG: `--text-secondary`
- **Accent (form-facing only)**
  - BG: `--accent`
  - FG: `--accent-contrast`

## Tabs

- Inactive: `--text-muted`
- Active: `--text-primary` + 2px bottom border `--text-primary`

## Cards/Panels

- Surface: `--bg-panel`
- Border: `--border-subtle`
- Radius: `--radius-lg`

## Inputs

- Surface: `--bg-field`
- Border: `--border-subtle`
- Text: `--text-primary`
- Placeholder: `--text-muted`
- Focus: 1px border + 2px outer ring using `--focus-ring` at reduced alpha

## Status Badges

- Live: `--success-bg` / `--success-fg`
- Draft: field background + subtle border + muted text

## 7) Form-Facing Experience Rules

- Use selected form `--accent` for:
  - CTA buttons
  - Selected options
  - Progress bar
  - Wordmark ampersand
- Keep other surfaces neutral.
- Long text and answer fields always use DM Sans for readability.

## 8) Interaction States

Define each interactive element with 5 states:

- `default`
- `hover`
- `active`
- `focus-visible`
- `disabled`

Minimum behavior:

- Hover must change either luminance or border contrast.
- Focus-visible must be keyboard-obvious without relying on hover.
- Disabled state must reduce contrast and block pointer events.

## 9) Motion

- Use subtle, fast transitions only:
  - `120ms` for hover/focus color changes
  - `160ms` for panel/card elevation changes
- Easing: `cubic-bezier(0.2, 0, 0, 1)`
- Avoid decorative motion in core form completion flow.

## 10) Copy and Content Style

- Prefer short labels and commands.
- Default to sentence fragments over full instructional prose.
- Examples:
  - `Add question`
  - `Not published`
  - `Copy link`
- Use title case sparingly; labels can stay lowercase where clear.

## 11) Accessibility Baseline

- Body and control text should target WCAG AA contrast.
- Do not use muted text for primary actions or form-critical labels.
- All actionable controls need keyboard focus-visible styles.
- Tap/click targets should be at least 36x36px in dense desktop views.

## 12) Implementation Contract (Current Foundation)

Use this rollout order in the existing app:

1. Create a central token layer in global styles (`:root` + dark theme tokens).
2. Add a typography utility layer (`.type-*` classes or equivalent utility mapping).
3. Refactor shared primitives first: button, input, badge, card, tab.
4. Apply system styles to admin screens.
5. Apply accent-variable rules to form-facing screens.

No new UI framework is required. This spec is built for incremental adoption on the current stack.

## 13) Acceptance Checklist

- Product name appears as `QandA` everywhere.
- Syne/DM Sans role split is consistent across admin and forms.
- Admin remains neutral and does not inherit form accent.
- Form accent is applied only to defined accent surfaces.
- Tokens, not raw hex values, are used in implementation.
- Primary text and controls meet readability requirements in dark mode.
