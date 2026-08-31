# Plan: CTooltip + CPopover

## Context

The library has no tooltip or popover component (never has, including the Stencil era), yet the design system already anticipates one: CONTEXT.md and ADR-0032 name `surface-inverted` as the tier for "toasts, a **future tooltip**". The user wants both components added, on native APIs where reasonable, with overwritable theming and slots. The grilling session established that the "native APIs" question is already settled by ADR-0008 (Popover API + CSS anchor positioning, shipped in c-menu/c-menu-item/c-autocomplete), so this work is an application of existing decisions plus a small number of new ones, listed below.

## Decisions (from the grilling session)

1. **Classic semantic split.** CTooltip = non-interactive hover/focus hint (`role="tooltip"`, never focusable content). CPopover = click-opened interactive surface (buttons/forms allowed). WAI-ARIA aligned.
2. **Wrap-the-trigger anchoring.** Trigger lives in a named `trigger` slot; the component owns listeners and mirrors ARIA onto it (CMenu's `slotchange` pattern). No anchor-by-id API.
3. **CTooltip content:** `text` prop for the common case + named `content` slot that overrides it (formatted but non-interactive — documented rule). **CPopover:** default slot body + optional `title` prop rendered as a heading part; no built-in header/footer/close button (minimal anatomy, extensible later).
4. **Theming = parts + semantic tokens only.** Tooltip paints on `surface-inverted`/`on-surface-inverted` (ADR-0032's anticipated second tenant); popover on `surface-overlay` like menu panels. No `--c-tooltip-*` public knobs (ADR-0004/0006).
5. **CTooltip interaction: full WCAG 1.4.13 contract + `delay` prop.** Show after delay on hover (default ~400 ms, `delay` prop in ms), immediately on keyboard focus; hoverable panel (grace period); hide on pointer-leave/blur/Escape (Escape doesn't move focus).
6. **CPopover: non-modal, light dismiss.** `popover="manual"` + capture-phase document `pointerdown` + `composedPath()` (c-menu pattern) + Escape. No focus trap, no auto-focus on open; restore focus to trigger on close iff focus was inside the panel. Modal needs → c-modal.
7. **Firefox: build on ADR-0008 and close its open risk.** Real-Firefox verification (c-menu + both new components on the OddBird polyfill path) is part of this task's acceptance criteria — ADR-0008 flags it as outstanding.
8. **No arrow in v1** (matches menu family; avoids arrow-vs-`position-try-fallbacks` geometry and polyfill risk; addable later behind a part).
9. **Fade-in only, instant close** — the existing 0.12s `:popover-open` keyframe convention; no `@starting-style`/`allow-discrete` debut.
10. **Shared `CPlacement` union in `src/types.ts`** (the 12 placements). Re-point c-menu's private `Placement` to it (non-breaking — never exported); both new components use it for `position`.
11. **Names stay `c-tooltip`/`c-popover`; CONTEXT.md resolves the word collision** — new **Tooltip** and **Popover** glossary entries; qualify existing mechanism uses as "native popover".
12. **One slim ADR-0033**: the tooltip/popover interactivity boundary (tooltip never interactive, popover never modal) + the cross-shadow `aria-description` approach (below). Everything else cites ADR-0008/0032/0006/0017.

Derived from repo conventions (not separately asked):
- Both: optional controlled `open` prop + all-lowercase `change:open` event via `useHostEmit` (ADR-0017); the panel's native `toggle` event is the single source of truth for state (c-menu convergence-point pattern).
- **Tooltip a11y:** `aria-describedby` can't cross the shadow boundary (ID refs are tree-scoped; ARIA element reflection forbids outer→inner). Mirror **`aria-description`** (string) onto the slotted trigger via `slotchange`/watch — from `text` or the content slot's textContent. Panel keeps `role="tooltip"`.
- CPopover panel: `role="dialog"` (non-modal); accessible name from `title` or host `aria-label`; console-warn when neither (c-modal precedent).
- `distance` prop via private inherited custom property (`--_c-tooltip-distance`, `--_c-popover-distance`) like c-menu.
- Fragment-rooted templates (anchor wrapper + panel) ⇒ `defineOptions({ inheritAttrs: false })` (also required by `lint:a11y` once host aria attributes are set).

## Implementation

**Model file: `packages/csc-ui/src/components/c-menu/CMenu.vue`** — copy its structure, not c-dropdown (legacy, INTERNAL_ONLY). Advanced fallback example: named `@position-try` rules in `CAutocomplete.vue:1095-1108`.

### 1. `packages/csc-ui/src/types.ts`
Add exported `CPlacement` (12-entry union). Update `c-menu/CMenu.vue` to import it instead of its private `Placement`.

### 2. `packages/csc-ui/src/components/c-tooltip/CTooltip.vue` (new)
- Template: `<span part="trigger" style="anchor-name: --c-tooltip-anchor"><slot name="trigger"/></span>` + `<div part="panel" popover="manual" role="tooltip" @toggle=...>` with `text` fallback rendering under `<slot name="content">`.
- Props: `text?`, `position?: CPlacement` (default `'top'`), `distance?`, `delay?` (ms, default 400), `open?` (controlled override).
- Events interface `CTooltipEvents { 'change:open': boolean }` via `useHostEmit`.
- Interaction: pointerenter/leave + focusin/focusout on the anchor wrapper, panel pointerenter/leave for hoverability, shared timer with grace period; document keydown Escape (capture) while open.
- On open: `showPopover()` (guarded) + `void ensureAnchorPositioning(host?.shadowRoot)` (`src/shared/anchorPolyfill.ts`).
- `tv` slots: `trigger`, `panel` (fixed/unset base per c-menu: `'fixed m-0 p-0 border-0 bg-transparent overflow-visible [inset:auto]'` + inverted-surface styling: `bg-surface-inverted text-on-surface-inverted`, small radius/padding/text-sm).
- Escape-hatch `<style>` (ADR-0007 header comment): `position-try-fallbacks`, `@keyframes c-tooltip-fade-in`.
- Mirror `aria-description` onto slotted trigger; docblock tags only (`@slot trigger`, `@slot content`, `@csspart trigger`, `@csspart panel`).

### 3. `packages/csc-ui/src/components/c-popover/CPopover.vue` (new)
Same skeleton; differences: click toggle on trigger (mirror `aria-haspopup="dialog"`/`aria-expanded`), default slot body + optional `title` prop rendered as `<div part="title">` heading, `role="dialog"` + labelling warn, light dismiss via document pointerdown capture + `composedPath()`, Escape, focus-restore logic, `surface-overlay` styling, parts: `trigger`, `panel`, `title`.

### 4. Colocated `usage.md` for both (ADR-0026)
First paragraph = component description. Sections: `## When to use` (tooltip vs popover vs modal boundary), `## Accessibility` (WCAG 1.4.13 contract; the aria-description rationale; popover labelling), `## Dismissal`, `## Customization` (parts + token overrides).

### 5. Registration — `packages/csc-ui/src/index.ts`
Imports (perfectionist-sorted); `['c-tooltip', CTooltip]`, `['c-popover', CPopover]` in the components array; re-export public types (`CTooltipProps`, `CPopoverProps`; `CPlacement` from types.ts) — analyzer errors if missing; append both tags to `tailwindVariantTags`; add both tags to the pre-upgrade placeholder selector list in `src/styles/css/tokens.css` (~line 435).

### 6. Generated artifacts
`pnpm docs:tag-map` (commit the regenerated `src/tag-name-map.ts`); `pnpm docs:manifest` / full `pnpm build` for the strict manifest; React wrappers regenerate automatically from the manifest.

### 7. Docs examples — `packages/csc-ui-documentation/app/examples/`
`c-tooltip/basic.*` and `c-popover/basic.*` in all four flavors (`.vue` canon with explicit imports, `.react.tsx`, `.angular.ts`, `.typescript.html`); parity script fails the docs build otherwise. Overlay demos render inside `<ClientOnly>` per existing SSR stub plugin.

### 8. Documentation updates
- **CONTEXT.md**: add **Tooltip** (`c-tooltip`) and **Popover** (`c-popover`) glossary entries (with `_Avoid_:` lines, e.g. avoid "hint", "flyout"; note tooltip ≠ interactive, popover ≠ modal); qualify the Top-layer entry's bare "popover" as "native popover (mechanism)".
- **`docs/adr/0033-*.md`** (slim): interactivity boundary + cross-shadow `aria-description` decision, alternatives considered (light-DOM describer node, cloned hidden text, element reflection).
- Changeset (`pnpm changeset`, minor): user-facing entry announcing both components.

## Verification

1. `pnpm build` in `packages/csc-ui` (tokens → tag map → vite → types → strict manifest) — catches undocumented parts/slots, missing type re-exports, stale tag map.
2. `pnpm lint:tokens`, `pnpm lint:a11y`, `pnpm lint:contrast`.
3. `pnpm dev` → docs at localhost:3500: hover/focus/Escape behavior, placement + `position-try-fallbacks` flipping at viewport edges, tooltip from inside a c-modal paints above it (top layer), popover light dismiss doesn't close a parent menu incorrectly.
4. Headless-chromium screenshots light/dark (memory: visual-verify recipe) for both components.
5. **Real Firefox pass** (polyfill path): c-menu, c-tooltip, c-popover placement + flip — closes ADR-0008's outstanding risk; record the result in ADR-0008.
6. `packages/csc-ui-react` build (wrapper generation) and docs build (example parity).

---

## Implementation deltas (as shipped)

- **`title` prop renamed to `heading`** (CPopover): `title` is a built-in `HTMLElement` property — it breaks the generated typed element interfaces (`CPopoverElement extends HTMLElement`) and, worse, a `title` attribute on the host triggers the browser's own native tooltip. Part renamed `title` → `heading` accordingly. Recorded in ADR-0033.
- **Placeholder list is generated, not hand-maintained**: `src/styles/css/tokens.css` is a gitignored style-dictionary artifact; the `:not(:defined)` tag list is derived automatically from `src/components/` directories (`style-dictionary.config.cjs`). No manual step needed.
- **`POSITION_AREA` + `placementAxis` extracted to `src/shared/positionArea.ts`** (used by c-menu, c-tooltip, c-popover) instead of triplicating the map.
- **c-alert fix folded in**: `pnpm lint:a11y` was already failing on this branch (c-alert sets host `role` without `inheritAttrs: false`); fixed as the lint prescribes.
- **`distance` is inlined** as a computed inline margin on the panel instead of a `--_c-*` custom property — unlike c-menu there is no nested panel needing inheritance.

## Verification results (2026-08-31)

- `pnpm build` (csc-ui): clean — 70 components, strict manifest, 0 errors.
- `lint:tokens` / `lint:a11y` / `lint:contrast`: clean. ESLint on changed files: clean.
- React wrapper build: clean after the `heading` rename.
- Docs example parity + prettier: clean.
- Playwright (chromium, light+dark): 22/22 interaction checks pass — hover delay, focus-immediate open, aria-description mirroring, role/label/aria-expanded, Escape, light dismiss. Screenshots confirm inverted tooltip + overlay popover in both modes.
- Forced-polyfill path (CSS.supports stubbed): both components open cleanly with OddBird loaded, no page errors.
- **OUTSTANDING: real-Firefox pass** (decision 7) — no Firefox in this environment; must be run on a machine with Firefox before ADR-0008's open risk is considered closed.
