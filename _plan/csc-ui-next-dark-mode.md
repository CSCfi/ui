# Dark mode for csc-ui-next via a semantic-token layer

## Context

`csc-ui-next` components author colour against **palette-step utilities** (`bg-white`,
`text-primary-600`, `bg-tertiary-100`, …) that resolve, via `@theme inline` in
`src/tailwind.css`, to `var(--c-white)`, `var(--c-primary-600)`, … The `--c-*` palette is a
single flat **light** ramp declared on the document `:root` by the **legacy Stencil package**
(`@cscfi/csc-ui`'s style-dictionary-generated `theme.css`) and inherited across shadow
boundaries (ADR-0004). `csc-ui-next` ships **no tokens of its own**.

Dark mode cannot be a palette swap: `bg-white` literally means white, and `text-primary-600`
(brand text) must diverge from `bg-primary-600` (fill behind white text) in dark — a single
ramp value can't express that. The fix is a **semantic-token layer** components author
against, which re-points to different palette steps per mode.

**All decisions are recorded in [`docs/adr/0010-dark-mode-via-semantic-tokens.md`](../docs/adr/0010-dark-mode-via-semantic-tokens.md).**
Glossary terms (Palette token, Semantic token, Theme mode, Surface ladder, `on-` token) are in
[`CONTEXT.md`](../CONTEXT.md). This plan is the execution path.

### Decision summary

| Axis | Decision |
|---|---|
| Strategy | Mode-aware **semantic-token layer**; no palette-swap, no per-component `dark:` |
| Vocabulary | CSC brand/status names (mode-aware) **+ new neutrals** (surface ladder, `on-*`, `border`, `ring`) |
| Elevation | 3-level ladder: `surface` / `surface-raised` / `surface-overlay` |
| Dark values | Engineering-designed, **remap existing `--c-*` steps**, no new hexes |
| Activation | `data-theme="dark|light"` on root + `prefers-color-scheme` fallback |
| Ownership | **Duplicate the style-dictionary pipeline into `csc-ui-next`**; emit a document-level token stylesheet |
| Authoring rule | **Semantic-only, CI-enforced**; palette-step utilities forbidden in SFCs |
| Scope | `csc-ui-next`-only; mixed light/dark during transition accepted |
| Rollout | Pilot `CButton`, then batches (mirrors ADR-0004) |

### Naming / namespacing

Semantic tokens are namespaced under the existing `--c-*` convention to avoid clobbering
consumer custom properties: the CSS variable is `--c-surface`, the Tailwind utility is
`bg-surface` (via `@theme inline { --color-surface: var(--c-surface) }`). The ADR/CONTEXT
examples write `--surface` illustratively; **the `--c-` prefix is authoritative.**

## Token set (implemented; dark steps still provisional pending contrast pass)

Neutrals use the `tertiary` ramp as the dark grey scale. Dark steps below are validated
visually but **finalised** against WCAG AA in phase 7. The brand/status set was expanded in the
`CButton` pilot (phase 3) to six tokens per role + a mode-invariant `inverse-*` family — see below.

### Neutrals

| Semantic token | Light → palette | Dark → palette | Replaces (examples) |
|---|---|---|---|
| `--c-surface` | `--c-white` | `--c-tertiary-900` | page `bg-white` |
| `--c-surface-raised` | `--c-white` | `--c-tertiary-800` | card `bg-white` |
| `--c-surface-overlay` | `--c-white` | `--c-tertiary-700` | popover/menu/modal/toast `bg-white` |
| `--c-surface-muted` | `--c-tertiary-100` | `--c-tertiary-800` | `bg-tertiary-100/200` |
| `--c-on-surface` | `--c-primary-900` | `--c-white` | body `text-primary-900` |
| `--c-on-surface-muted` | `--c-tertiary-500` | `--c-tertiary-300` | secondary `text-tertiary-500/600` |
| `--c-border` | `--c-tertiary-200` | `--c-tertiary-700` | `border-*`, dividers |
| `--c-ring` | `--c-primary-600` | `--c-primary-400` | focus `ring-*` |

### Brand / status (each, for `primary secondary accent success info warning error link`)

| Semantic token | Light → palette | Dark → palette | Replaces |
|---|---|---|---|
| `--c-<role>` | `--c-<role>-600` | `--c-<role>-300` | `text-/bg-/ring-<role>-600` |
| `--c-<role>-hover` | `--c-<role>-400` | `--c-<role>-200` | `hover:bg-<role>-400` (solid hover) |
| `--c-on-<role>` | `--c-white` | `--c-<role>-900` | `text-white` on a fill |
| `--c-<role>-subtle` | `--c-<role>-200` | `--c-<role>-800` | `bg-<role>-200` tint fill |
| `--c-<role>-subtle-hover` | `--c-<role>-100` | `--c-<role>-900` | `hover:bg-<role>-100` (tint hover) |
| `--c-on-<role>-subtle` | `--c-<role>-700` | `--c-<role>-200` | text on a subtle tint |

### Mode-invariant `inverse-*` (identical light & dark; for the `inverted` variants)

| Semantic token | Value (both modes) | Replaces |
|---|---|---|
| `--c-inverse-surface` | `--c-white` | inverted solid face (`bg-white`) |
| `--c-inverse-on` | `--c-white` | inverted fg / translucent fills (`text-white`, `bg-white/20`) |
| `--c-inverse-primary` | `--c-primary-600` | inverted-default text (`text-primary-600` on white) |
| `--c-inverse-error` | `--c-error-600` | inverted-danger text (`text-error-600` on white) |

> The `subtle` pair is only generated for roles that actually have tint usages (audit in
> Phase 3 confirms which). Don't emit unused tokens.

## Approach

### Phase 0 — Token pipeline into `csc-ui-next`

Goal: `csc-ui-next` produces its own tokens; legacy `@cscfi/csc-ui` no longer required for tokens.

1. Copy `packages/csc-ui/tokens/` → `packages/csc-ui-next/tokens/` (palette `theme/base.json`,
   `index.js`).
2. Copy `style-dictionary.config.js` + `utils/` (`createTheme`, `setValue`) into
   `csc-ui-next`. Trim to the outputs `next` needs: **`css/theme`** (the `--c-*` palette) and a
   **new semantic/dark format** (below). Drop the Stencil-only scss/tailwind-theme.js outputs
   unless the docs site still consumes them.
3. Add `style-dictionary` devDep + `style-dictionary:build` script; wire it into `next`'s build
   before the Vite/`defineCustomElement` step.

### Phase 1 — Author the semantic + dark token sources

1. `tokens/theme/semantic.json` — the role→light-step map (table above) as references
   (`"value": "{theme.primary.600.value}"` style, or `var(--c-primary-600)` literals — match
   `createTheme`'s existing reference handling).
2. `tokens/theme/dark.json` — the role→dark-step map.
3. New style-dictionary format/platform emitting **`dist/css/tokens.css`** with three blocks:
   ```css
   :root, :root[data-theme='light'] { --c-surface: var(--c-white); /* …light semantic… */ }
   :root[data-theme='dark']         { --c-surface: var(--c-tertiary-900); /* …dark… */ }
   @media (prefers-color-scheme: dark) {
     :root:not([data-theme])        { --c-surface: var(--c-tertiary-900); /* …dark… */ }
   }
   ```
   The palette `--c-*` block (existing `theme.css`) ships too — either merged into `tokens.css`
   or kept as a sibling import. **Decide: single `tokens.css` (palette + semantic + dark) is the
   cleaner consumer story.**

### Phase 2 — Wire utilities into the shadow-root sheet

In `src/tailwind.css`, extend `@theme inline` with the semantic entries so utilities resolve
inside shadow roots:
```css
@theme inline {
  /* existing palette entries stay */
  --color-surface: var(--c-surface);
  --color-surface-raised: var(--c-surface-raised);
  --color-surface-overlay: var(--c-surface-overlay);
  --color-surface-muted: var(--c-surface-muted);
  --color-on-surface: var(--c-on-surface);
  --color-on-surface-muted: var(--c-on-surface-muted);
  --color-border: var(--c-border);
  --color-ring: var(--c-ring);
  --color-primary: var(--c-primary);
  --color-on-primary: var(--c-on-primary);
  /* …all brand/status roles… */
}
```
Verify `bg-surface` / `text-on-surface` / `bg-primary` generate and resolve inside a shadow root
(the `@theme inline` substitution makes the value literal, same mechanism as palette tokens).

### Phase 3 — Pilot: convert `CButton`

`CButton.vue` is the locked reference (ADR-0004). Re-author its `tailwind-variants` config from
palette-step to semantic utilities:
- `bg-primary-600` → `bg-primary`, `text-white` → `text-on-primary`, ghost/outline text
  `text-primary-600` → `text-primary`, disabled/muted → `*-muted`, focus `ring-*` → `ring-ring`.
- Confirm every variant/compound (filled/outlined/ghost × primary/secondary/success/…/error,
  disabled, loading ripple) maps to a role. Surface any colour with **no** semantic home — that's
  a gap in the token set; add the token, don't reach for a palette step.
- Manually verify CButton in light and dark (`data-theme` toggle) before proceeding.

### Phase 4 — CI guard (semantic-only) — DONE

Implemented as `scripts/check-palette-utilities.mjs` (npm script `lint:tokens`). It flags colour
utilities whose colour is a brand/status hue **with a numeric step** (`bg-primary-600`) or
`white`/`black` (`text-white`, incl. `/opacity`), while allowing the bare semantic tokens
(`bg-primary`, `primary-hover`, `primary-subtle`, `surface`, `inverse-*`, …) and
`current`/`transparent`. **Comments are stripped first** (newlines preserved) so explanatory
comments mentioning palette steps don't false-positive — verified against the existing migration
notes in CLoginCard/CTag.

A plain grep was rejected because those comment references trip it; a node script that strips
comments was simpler than a custom ESLint rule and good enough.

- Default: report + exit 0 (informational — doubles as the phase-5 worklist).
- `--strict`: exit 1 on any violation. **Flip `lint:tokens --strict` into CI/lint once phase 5
  lands.**
- **Baseline (after the CButton pilot): 191 palette-step utilities across 38 of 72 SFCs;
  CButton is clean.**
- Not covered: arbitrary-value var refs like `text-[var(--c-text-body)]` (a few components use
  them). Out of scope for the utility-class guard; sweep separately in phase 5 if needed.

### Phase 5 — Batch migrate remaining 71 components

**Progress (commits on `vue-migration`):**
- 5a surfaces/layout — c-page, c-main, c-toolbar, c-backdrop, c-divider, c-card, c-card-title ✅
- 5b popover/list — c-menu(+item/label), c-dropdown, c-list(+item/item-title) ✅
- 5c value-select — c-autocomplete, c-select ✅
- 5d status/feedback — c-alert, c-status, c-badge, c-message, c-tag, c-progress-bar, c-loader, c-toast ✅
- 5e form fields — c-input, c-text-field, c-otp-input, c-slider ✅ (added neutral role **`border-strong`** for control outlines)
- 5e2 toggles — c-checkbox, c-radio-group, c-switch, c-spinner ✅
- **Guard tightened**: now also catches arbitrary-value (`text-[var(--c-error-600)]`) and
  escape-hatch (`var(--c-primary-600)`, `var(--c-…-rgb)`) palette refs — true surface was
  under-reported. After 5e2: **134 refs in 18 SFCs** remaining.
- **Remaining (5f, nav/structure + table)**: c-icon-button, c-tab(+tabs/tab-buttons), c-step(+steps),
  c-accordion-item, c-side-navigation(+item/title), c-sub-navigation-item, c-link, c-login(+button/card/card-title),
  c-table. **Skip** c-swiper / c-swiper-tab (confirmed in `_todo` "Remove these" — will stay as guard hits until deleted).

Convert in reviewable batches; suggested grouping by colour complexity:
1. **Containers / surfaces** (highest payoff for the ladder): `c-card*`, `c-modal`, `c-menu*`,
   `c-toast*`, `c-autocomplete`, `c-dropdown`, `c-backdrop`, `c-page`, `c-main`, `c-toolbar`,
   `c-side-navigation*`.
2. **Form controls**: `c-input`, `c-text-field`, `c-checkbox`, `c-radio*`, `c-switch`,
   `c-select`, `c-slider`, `c-otp-input`, `c-option*`.
3. **Status / feedback**: `c-alert`, `c-message`, `c-status`, `c-badge`, `c-tag*`, `c-progress-bar`,
   `c-loader`, `c-spinner`.
4. **Navigation / structure**: `c-tab*`, `c-accordion*`, `c-steps`/`c-step`, `c-pagination`,
   `c-list*`, `c-link`, `c-divider`, `c-navigation-button`, `c-login*`.
5. **Remainder**: `c-icon*`, `c-csc-logo`, `c-row`, `c-spacer`, `c-swiper*` (note: `c-row`,
   `c-spacer`, `c-swiper` are flagged for removal in `_todo` — confirm before investing).

Each component: map palette steps → roles, add any missing token, verify light+dark. Flip the
Phase 4 guard to blocking once the last batch lands.

### Phase 6 — Docs & consumer API

- Update getting-started (`vue3`/`react`/`angular`) to import `@cscfi/csc-ui-next/css/tokens.css`
  and document `data-theme` activation + the `prefers-color-scheme` fallback.
- Add a dark-mode toggle to the documentation site shell so every component example is viewable
  in both modes.
- Refresh/extend the design-tokens page to show semantic tokens (currently shows palette only).

### Phase 7 — Verification

- **Contrast**: every `on-*` / surface (and `*-subtle`) pair at WCAG AA — adjust dark steps in
  `dark.json` where it fails; this finalises the provisional table.
- **Visual**: each migrated component in light + dark via the docs toggle.
- **Guard**: Phase 4 check green across `src/components`.

## Open questions

1. ~~**`tokens.css` shape**~~ — RESOLVED (phase 1): single `tokens.css` (palette + semantic +
   dark), one consumer import.
2. ~~**Final sub-role list**~~ — RESOLVED (phase 3 pilot): six tokens per role (`<role>`,
   `-hover`, `on-<role>`, `-subtle`, `-subtle-hover`, `on-<role>-subtle`) + mode-invariant
   `inverse-*` family. Generated for all 8 roles for consistency; unused ones are negligible CSS
   vars (and emit no utility unless a component uses it). Revisit only if phase 5 needs more.
3. **Disabled & focus states in dark** — pilot used `surface-muted` / `on-surface-muted` /
   `border` for disabled and the appearance colour for focus outline; no dedicated `disabled`
   token needed so far. Watch in phase 5 (esp. disabled on a `surface-raised`/`surface-overlay`
   panel, where `surface-muted` can collide in dark — may want a `disabled` token then).
4. **Keep or drop** the Stencil-only style-dictionary outputs (`tailwind/theme.js`, scss) in
   `next`'s copied config — depends on whether the docs site still consumes them.

## Out of scope

- Retrofitting dark mode onto Stencil `@cscfi/csc-ui` components (frozen, light-only, being
  deleted — ADR-0010).
- New design-provided dark hexes (engineering remaps existing ramp steps; reconcile if a design
  handoff lands).
- Named themes beyond light/dark (the `data-theme` mechanism leaves the door open; not built now).
