# CToast restyle: inverted-surface toasts (per design mock)

> Execution note: per repo convention, copy this plan to `/workspace/_plan/toast-inverted-surface.md` as the first execution step (plans live in the repo's `_plan/` folder).

## Context

The design mock (`/workspace/temp/Screenshot 2026-08-28 at 15.54.40.jpg`) redefines toasts as **inverted-surface pills**: near-black toast on light backgrounds, white toast on dark backgrounds; status carried solely by a circular tinted icon badge; neutral ✕ close; no accent border. The current `CToast.vue` is a white `surface-raised` box with a 12px accent left border and accent-colored close icon.

Decisions settled in the grilling session (with Oskari, 2026-08-28):

1. **Tokenization**: new mode-flipping semantic roles (`surface-inverted` family) — the existing `inverse-*` family is mode-invariant and must NOT be redefined; palette steps in SFCs are forbidden (ADR-0010).
2. **Badges**: dedicated `*-inverted` / `on-*-inverted` status roles per family, defined as the opposite mode's audited pairs.
3. **Accent left border**: dropped entirely — deliberate divergence from `c-alert`'s accent-edge language (alert = persistent in-flow; toast = transient overlay).
4. **Custom-slot toasts**: also inverted (one surface for the whole stack); consumers restyle via `::part(root)`.
5. **Glossary**: `surface-inverted` is a general fourth rung of the surface ladder (toast first tenant, future tooltip second). CONTEXT.md already updated (done pre-plan-mode, keep).
6. **Close control**: plain `<button part="dismiss">` modeled on `c-alert`'s dismiss, replacing nested `c-icon-button`/`c-button` and the `ACCENT_VAR` hack.
7. **ADR-0032** records the inverted-surface tier decision.

## Changes

### 1. Semantic tokens — `packages/csc-ui/tokens/semantic/light.json` + `dark.json`

Add (keep keys in sync between files; values are palette-step keys):

**light.json** (dark pill on light page — borrows the *solid* status look):
```
"surface-inverted": "slate-950",
"on-surface-inverted": "white",
"on-surface-inverted-muted": "slate-300",
"success-inverted": "success-500",  "on-success-inverted": "white",
"info-inverted": "info-500",        "on-info-inverted": "white",
"warning-inverted": "warning-500",  "on-warning-inverted": "white",
"error-inverted": "error-500",      "on-error-inverted": "white",
```

**dark.json** (white pill on dark page — borrows light mode's *subtle* pairs, already contrast-audited on white):
```
"surface-inverted": "white",
"on-surface-inverted": "slate-900",
"on-surface-inverted-muted": "tertiary-500",
"success-inverted": "success-100",  "on-success-inverted": "success-700",
"info-inverted": "info-100",        "on-info-inverted": "info-700",
"warning-inverted": "warning-100",  "on-warning-inverted": "warning-700",
"error-inverted": "error-100",      "on-error-inverted": "error-700",
```

Badge-pair rationale: light-mode pairs equal the existing audited solid pairs; dark-mode pairs equal the existing audited light-mode subtle pairs — only the neutral inks on `slate-950`/`white` are genuinely new combos. Exact steps (e.g. `slate-950` vs `slate-900`) may be tuned in the visual pass.

### 2. Tailwind theme export — `packages/csc-ui/src/styles/css/tailwind-theme.css`

Hand-maintained `@theme inline` map ("KEEP IN SYNC" per its header): add one `--color-<role>: var(--c-<role>)` line per new role, grouped after the surface-ladder block. `tokens.css` itself is **generated** — regenerate via `pnpm --filter @cscfi/csc-ui style-dictionary:build` (config already reads the semantic JSONs).

### 3. `packages/csc-ui/src/components/c-toast/CToast.vue` — the restyle

**Template**:
- Wrap the type icon in a badge: `<span :class="ui.badge()" part="badge"><svg :class="ui.icon()" …/></span>`.
- Replace both close controls (`c-icon-button` and `c-button`) with one plain `<button :class="ui.dismiss()" part="dismiss" aria-label="close" type="button">` following `CAlert.vue`'s dismiss pattern (inline ✕ svg, `fill-current`); when `message.closeText` is set, render the label text next to the icon in the same button.
- Remove the `c-icon` usage and the `accentColor` binding.

**tv config**:
- `box`: drop `border-2 border-l-[12px]`, `bg-surface-raised`, `text-on-surface-muted` → `bg-surface-inverted text-on-surface-inverted rounded-csc-lg` (up from `rounded-csc-md`, per the mock's rounder pill), keep `min-h-[52px]` and grid, padding ~`p-2 pl-3`.
- New `badge` slot: `grid size-7 shrink-0 place-items-center rounded-full`; per-type variant sets `bg-success-inverted` etc.
- `icon`: `size-4 shrink-0` with per-type `fill-on-success-inverted` etc. (was 24px raw glyph; update `item` grid `grid-cols-[24px_1fr]` → `grid-cols-[28px_1fr]`).
- `item`: drop `font-light`.
- `content`: `text-on-surface-inverted-muted`; `title`: keep `font-semibold`, add `text-on-surface-inverted` (title full ink, body muted — mock shows title-only but the message body remains supported).
- New `dismiss` slot mirroring CAlert's: neutral `text-on-surface-inverted-muted`, `hover:bg-on-surface-inverted/10 hover:text-on-surface-inverted`, `focus-visible:outline-2 focus-visible:outline-on-surface-inverted`, `cursor-pointer`.
- `progress`: track `bg-on-surface-inverted/15`; `progressBar`: neutral `bg-on-surface-inverted` (status is carried by the badge; per-type progressBar variants removed). The `type` variant then only touches `badge` + `icon`.

**Script**:
- Delete `ACCENT_VAR` / `accentColor` (keep the `toastType` fallback-to-info computed, now feeding only the tv variant + host classes).
- Update `@csspart` docblock: adjust `root` description (no accent border), add `badge` and `dismiss`.

**Escape-hatch `<style>`**: keep the host enter/leave transition, hover pause, keyframes, and the multi-layer shadow as plain CSS (known Tailwind multi-layer `shadow-[…]` breakage — see file comment); no changes expected beyond possibly softening the shadow to match the mock.

Everything else (timers, hover-pause, live-region attrs, `inheritAttrs:false`, `closeToast` expose, visually-hidden type prefix) stays as is. **`CToasts.vue` needs no changes.**

### 4. ADR — `docs/adr/0032-inverted-surface-tier.md`

Decision: a fourth, contrast-flipping surface-ladder rung (`surface-inverted` + `on-surface-inverted(-muted)` + per-family `*-inverted`/`on-*-inverted`); toasts leave the overlay tier. Rejected alternatives: redefining the mode-invariant `inverse-*` family (breaking semantic shift for fixed-backdrop consumers); staying on `surface-overlay` (rejects the design's standout intent). Consequences: toast intentionally diverges from `c-alert`'s accent-edge grammar; dark-mode inverted pairs reuse light-mode audited subtle pairs. Follow existing ADR format (see `docs/adr/0031-*.md`).

### 5. Bookkeeping

- **CONTEXT.md**: already updated (surface-ladder entry + new **Inverted surface** term) — verify wording still matches the implementation.
- **Changeset** (user-facing, high-level, minor): "Redesign toasts as inverted-surface notifications; add inverted-surface semantic tokens."
- **Manifest**: `pnpm --filter @cscfi/csc-ui docs:manifest` picks up the new/changed cssparts. React wrapper regenerates at its build; no API change (props/events/methods untouched).
- `usage.md` files contain no styling prose — no updates needed.

## Verification

1. `pnpm --filter @cscfi/csc-ui style-dictionary:build` — tokens regenerate cleanly.
2. `pnpm --filter @cscfi/csc-ui lint:contrast` — new pairs pass AA (check the report for the new roles in both modes).
3. `pnpm --filter @cscfi/csc-ui lint:tokens` and `lint:a11y` — no palette-step utilities, no host-attr fallthrough regressions.
4. `pnpm --filter @cscfi/csc-ui build` — full build incl. vue-tsc + strict manifest.
5. **Visual**: headless-chromium screenshot recipe (memory: `project_csc_ui_next_visual_verify`) — render a stack with success/warning/error + a titled+body toast + progress + closeText variants, in light and dark, and compare against `/workspace/temp/Screenshot 2026-08-28 at 15.54.40.jpg`. Tune `slate-950` vs `slate-900`, radius, badge size, shadow in this pass.
