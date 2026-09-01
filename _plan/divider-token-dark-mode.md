# Fix: divider invisible on dark-mode overlay surfaces — new `divider` semantic token

> On approval, copy this plan into the repo's `_plan/` folder (house convention) before starting.

## Context

`c-divider` is invisible inside `c-menu` and `c-autocomplete` panels in dark mode. Root cause: there is no divider token — `CDivider.vue:28` paints `bg-border`, and in dark mode `--c-border` and `--c-surface-overlay` both resolve to `slate-700` `#3c4247` (contrast **1.00:1**). The break is specific to the overlay rung; on `surface`/`surface-raised` the dark contrast (1.32:1) matches light mode's reference hairline (1.31:1). `CAutocomplete.vue:413` has the same bug in a second guise: `border-b border-border` on its `bg-surface-overlay` search row. Nothing catches this in CI — `scripts/audit-contrast.mjs` audits no pair against `surface-overlay`.

## Decisions (grilling session, 2026-08-31)

1. **New `divider` semantic role** — not a retune of `border` (≈40 call sites; c-table/c-data-table grid lines are stacked inset box-shadows where translucent ink doubles at shared cell edges), not component-local alpha.
2. **Translucent ink via `color-mix`**: black @ 12% light, white @ 12% dark. One value reads consistently on every surface-ladder rung (light stays pixel-identical to today's `tertiary-200`; dark reads 1.43:1 on the overlay rung). Authored token-referencing, not as hex literals.
3. **Named `divider`** (follows the tag `c-divider`), accepting the mismatch with the glossary's canonical concept name *Separator* — recorded in the glossary.
4. **Scope**: `CDivider` + the autocomplete search-row line. `border` remains the role for component frames/outlines; data-table group row untouched.
5. **Recorded as ADR-0036** (consumer-facing token API; the only translucent role; real trade-off with measured data).

## Implementation

### Token layer (`packages/csc-ui`)

1. `tokens/semantic/light.json` (beside `border`, ~L13): `"divider": "color-mix(in srgb, var(--c-black) 12%, transparent)"`.
   `tokens/semantic/dark.json` (same position — key sets must match): same with `var(--c-white)`.
2. `utils/createSemanticTheme.cjs:29-36` — the resolver only understands `#hex` literals and palette-step keys. Add a branch that emits values verbatim when they are not a bare step key (e.g. contain `(`), so `color-mix(...)` passes through instead of becoming `var(--c-color-mix(...))`.
3. `src/styles/css/tailwind-theme.css` (~L36, beside `--color-border`) — hand-maintained; add `--color-divider: var(--c-divider);` (header comment mandates sync with the semantic JSON). This also exports `bg-divider` to consumers via the Tailwind theme export.
4. Regenerate the committed `src/styles/css/tokens.css`: `pnpm run style-dictionary:build`.
5. `scripts/check-palette-utilities.mjs` needs no change (verified: `divider` not in `HUES`, `bg-divider` not matched by `FORBIDDEN`).

### Components

6. `src/components/c-divider/CDivider.vue:28`: `bg-border` → `bg-divider`.
7. `src/components/c-autocomplete/CAutocomplete.vue:413`: `border-border` → `border-divider`.

### Contrast audit

8. `scripts/audit-contrast.mjs`: `resolve()` (L33-46) returns `undefined` for `color-mix` values (role silently dropped) and `srgb()` (L51-55) strips alpha from 8-digit hex. Teach it to composite a translucent ink over the paired surface before computing the ratio, then add `divider` pairs against every ladder rung (`surface`, `surface-raised`, `surface-overlay`, `surface-muted`). Hairlines can't meet the 3:1 non-text threshold by design — add these as a regression tier asserting a floor (≥1.25:1) so the 1.00:1 failure mode can never ship silently again. Inspect the script's existing threshold mechanism and fit the tier to it.

### Documentation & release

9. **ADR** `docs/adr/0036-divider-role-is-a-translucent-ink.md` (0035 exists, untracked): why `divider` exists apart from `border`; why alpha (single value across all rungs — include the measured contrast table); why `border` was NOT retuned (inset-shadow seam doubling); consequences (only translucent semantic token; generator verbatim branch; audit compositing). One-line pointer added to ADR-0010's neutral-role bullet.
10. **CONTEXT.md**:
    - *Semantic token* entry (~L153): neutral role list gains `divider`.
    - *Separator* entry (~L56): note it paints the `divider` role — a translucent ink readable on every surface rung — and that the role deliberately takes the tag's name.
11. **Changeset** (patch, both packages are a fixed group): user-facing wording — dividers/separator lines now visible on dark-mode overlay surfaces (menus, autocomplete); new `divider` semantic token + `bg-divider` utility.
12. No React wrapper change expected (token-only; no props/events/parts). `usage.md` for c-divider: mention the token in the styling notes if it already discusses color; otherwise skip.

## Verification

- `pnpm ui build` — full chain (tokens → tag map → vite → types → strict manifest) passes.
- `pnpm ui lint:tokens` — confirms `bg-divider` isn't flagged.
- Run the contrast audit: new divider pairs report ~1.32 (light) / ~1.43–1.46 (dark); spot-check the guard by temporarily setting divider to `slate-700` and confirming it fails.
- Visual check in dark **and** light mode via `pnpm dev` (http://localhost:3500): a `c-menu` with slotted `c-divider`, and an open `c-autocomplete` panel (search-row line). Use the headless-chromium screenshot recipe if no display. Note: the c-divider docs examples render on the page surface, not in a menu — verify via the c-menu/c-autocomplete example pages.
- Confirm token output: `tokens.css` contains `--c-divider: color-mix(...)` in the `:root`, `[data-theme='dark']`, and `prefers-color-scheme: dark` blocks.
