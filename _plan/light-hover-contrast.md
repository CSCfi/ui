# Contrast follow-ups: lighter hover fills and primary on its tint

Parked during the status-colour grill (2026-11-04, ADR-0080). Both predate it, and both reach past warning and error.
Grilled 2026-11-04; options shown at https://claude.ai/artifact/LxGtTeSN5HhN1fwcRVyFgN. Lands before 4.0.0 with the
renames, variants and status colours.

## The failures

**1. Light filled hover.** In light mode a filled role lightens on hover (`<role>-hover` → step 300), but its white
`on-<role>` label stays:

| Role | Hover fill | White on it |
|---|---|---|
| `primary` | primary-300 | 2.82:1 |
| `secondary` | secondary-300 | 3.75:1 |
| `error` (c-button `danger`) | error-300 | 2.53:1 |
| `accent` | accent-300 | 1.54:1 (2.14:1 even at rest) |
| `link` | accent-100 | 1.18:1 |

The library's users are:
- c-button and c-icon-button filled;
- the Done buttons of the color, date and time pickers;
- the date picker's selected day, the time picker's selected cell and the color picker's pressed swatch;
- c-tag's active hover.

All of them use primary, secondary or error. Success, info and warning pass, because their labels are dark
(d95be1d4). Dark mode passes everywhere.

**2. A role's colour as text on its own tint.** Primary on `primary-subtle` reads 3.72:1 in dark mode (4.64 light).
Across the families, role-on-own-tint reads as low as 1.42:1 (light warning) and 2.56:1 (dark error). The paired
`on-<role>-subtle` reads ≥ 4.74:1 everywhere.

## Decisions (grill, 2026-11-04)

1. **Hover moves the fill away from its label.**
   - In light mode, white-label roles hover on step 600: `primary-hover`, `secondary-hover` and `error-hover` →
     `*-600` (8.3, 11.7 and 6.9:1).
   - Dark-label roles keep lightening on 300.
   - Dark mode is unchanged: every label there is dark and the fills already lighten.
   - Rejected:
     - an 8% white state layer: primary 5.5, danger 4.8:1, and it is not a palette step;
     - step 400: primary 4.25, danger 3.6:1.
2. **Accent and link follow the same rules** (token-only; no component fills with them):
   - **Accent gets dark labels in light mode**, like success, info and warning:
     - `on-accent` → accent-950 (8.4:1 at rest, 11.7:1 on the 300 hover, which stays);
     - `on-accent-subtle` → accent-800 (7.0:1 on its tint; accent-700 read 4.32).
     - This fixes the docs site's "next" badge (`bg-accent text-on-accent`).
   - **Link's light hovers stay in the family:**
     - `link-hover` → link-600 (14.3:1 under white, and as text on white);
     - `link-subtle-hover` → link-50 (`on-link-subtle` 14.7:1).
     - This drops the accent-100 references ADR-0034 left open.
3. **Text on a role's tint uses the tint's ink, `on-<role>-subtle`**; the ring or outline may stay the role. Fix every
   place that breaks it:
   - c-menu-item (hover, plus the `[data-active]` style block);
   - c-dropdown (hover and focus);
   - c-autocomplete and c-tree-select (`data-[active]`);
   - c-date-picker (hovered day, selected cell);
   - c-time-picker (selected cell);
   - c-breadcrumb-item (hover);
   - `shared/PanelHeadingRow.vue` (hover);
   - c-data-table's sortable header hover (style block);
   - c-file-upload's "choose files" (`text-primary` over `hover:bg-primary/15`);
   - c-card's fullscreen toggle (`text-primary` over `hover:bg-primary-subtle-hover`, 4.6:1 as an icon, inked the same way
     for one rule).
4. **A guard keeps it fixed:** `scripts/check-tint-ink.mjs` as `lint:tint`, added to `lint:guards`.
   - It flags a class string where, under one state (`hover:`, `focus:`, `data-[active]:`, `aria-selected:`, … or
     none), the background is a role's tint and the effective text is that role's own colour.
   - A tint is `bg-<role>-subtle`, `bg-<role>-subtle-hover` or `bg-<role>/<n>`.
   - The effective text is the state's own `text-*`, or the base `text-*` when the state sets none.
   - It also flags a `<style>` rule that sets `background-color: var(--c-<role>-subtle…)` and `color: var(--c-<role>)`.
   - Model: `scripts/check-focus-rings.mjs` (strip comments, keep line numbers, always strict).
5. **ADR-0081** "Hover moves the fill away from its label; text on a tint takes the tint's ink". ADR-0034 (its kept
   "lighten on hover" now holds for dark-label fills and dark mode only) and ADR-0079 get back-link lines.

Settled by convention:
- The glossary's **Semantic token** entry gains the tint-ink rule.
- Every Fix commit gets its own patch changeset and a spec that fails before it.

## Commits

1. **`Fix(tokens): Light filled hover darkens under a white label`**
   - `tokens/semantic/light.json`: `primary-hover`, `secondary-hover` and `error-hover` → `*-600`, plus a comment.
   - `scripts/audit-contrast.mjs`: add `on-<role> / <role>-hover` pairs for every role, in both modes.
   - `src/test/buttonVariants.ts`: add "reads at AA hovered, filled, in every variant and both modes". It hovers the
     button with `userEvent.hover` and measures after the colour transition (`settled()`). It fails before for
     primary, secondary and danger in light mode.
   - Regenerate baselines: c-button, c-icon-button, and the pickers' selected or hover states if any baseline shows
     them. c-tag has no baselines.
   - Changeset: patch.
2. **`Fix(tokens): Accent takes dark labels; link's hovers stay in the family`**
   - light.json: `on-accent`, `on-accent-subtle`, `link-hover`, `link-subtle-hover`.
   - The audit's known failures drop to the nav-hover pair only.
   - Spec: `src/theme/` node spec. In light mode, accent's and link's labels and hovers clear AA, resolved from the
     JSON maps, as `tailwindTheme.node.spec.ts` reads them. It fails before.
   - The docs badge needs no edit; refresh the docs screenshots if the toolbar shows in one.
   - Changeset: patch.
3. **`Fix: Text on a role's tint takes the tint's ink`**
   - The sweep in decision 3, plus the guard in decision 4, wired into `lint:guards`.
   - Specs: one `src/test/tintInk.spec.ts` that hovers, focuses or activates each fixed state in dark mode and checks
     the text's contrast against the background it actually sits on. It fails before.
   - Regenerate baselines for every touched component: the pickers, autocomplete, tree-select, menu, data-table,
     breadcrumb, file-upload, and the docs screenshots.
   - Glossary line. Changeset: patch.
4. **`Docs: Hover and tint contrast in the records`**: ADR-0081, the back-links, and this plan with its commit hashes.

## Verification

- Each new spec fails against HEAD sources first.
- Touched specs, one file per run, on Chromium and then Firefox (scratch Playwright install).
- `pnpm ui type-check`, `pnpm lint` (the new guard, the API guard), `pnpm format:check`, `lint:contrast`: the new
  hover pairs all pass, and the only remaining failures are nav hover and the recorded dark overlay error text.
- Baselines: pixel-regen recipe, review the changed PNGs.
- Build, then the docs example smoke in every flavour.
- Gate commits on tree counts; never push.

## Decided while building (2026-11-04)

- **The dark tint hovers follow the hover rule** (user decision). The new role-contrast node spec found dark
  `*-subtle-hover` lightening toward the light ink for accent, success, info, warning and error (3.4–4.3:1). They now
  darken one step: info and error to 800, accent, success and warning to 900. No library component uses them.
- **The side navigation's hover follows the hover rule** (user decision): light `nav-surface-hover` goes from
  primary-400 (4.25:1) to primary-600 (8.3:1), as its own Fix commit.
- **The guard found 22 places, not 11.** Its first version took `text-sm` and `text-[length:inherit]` for text
  colours, which hid `text-primary` beside them. The real list adds:
  - c-accordion-item's hover and pressed header (`bg-primary/8`, `/15`);
  - c-breadcrumb's fold button (hover, `aria-expanded`);
  - c-breadcrumb-item's interactive link;
  - the date and time pickers' hovered footer buttons;
  - c-link's hover (`text-link` on `link-subtle`).

## Commits (2026-11-04, `development`, unpushed)

- 7873b928 `Fix(tokens): Light filled hover darkens under a white label`
- 8aae9e12 `Fix(tokens): Accent takes dark labels; hovers move away from the text`
- 0ad8434b `Fix(tokens): The side navigation's hover darkens under its white label`
- 5717b3f1 `Chore(c-card-title): Refresh the stale wrapped-actions baseline` (stale since ae56c6ec)
- 678a68ed `Chore(c-toolbar): Refresh the stale toolbar baseline` (stale since ae56c6ec)
- 0ec50d72 `Fix: Text on a role's tint takes the tint's ink`
- the records commit: ADR-0081, the back-links in ADR-0034 and ADR-0079, this plan

The contrast audit now prints one failure, the dark overlay error text recorded in ADR-0080.
