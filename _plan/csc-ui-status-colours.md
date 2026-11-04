# Warning and error: a yellow warning and a redder error (before 4.0.0)

## Context

The user finds warning and error too similar and wants "a more yellow warning and a more red error/danger".

- **Seeds today:** warning `#ff5800` (orange, hue 39.5°) and error `#dd0c0c` (hue 28.8°), only 11° of hue apart.
- **Light mode:** their alert washes and status chips are both pink.
- **Dark mode:** both fills are salmon, warning-400 `#ff8256` and error-300 `#ff7b6b`. The dark error fill sits on step 300
  because the same `error` token also draws error text, which needs 4.5:1 on the dark surface (f3d9a620).
- **Comparison page:** the options were shown at https://claude.ai/artifact/SRwj1RCVy7h2pekuZrcoqx.

Lands on `development` before 4.0.0 with the renames and variants (unpushed; the user pushes).

## Decisions (grill, 2026-11-04)

1. **Warning seed is `#ffc400` (yellow, hue 86.6°)**, 58° of hue from error. It needs darker steps where it draws text
   or icons:

   | Role | Mode | Old step | New step | Contrast |
   |---|---|---|---|---|
   | `on-warning-subtle` | light | 700 | **800** `#6f5300` | 7.2:1 on white |
   | `inverse-warning` | invariant | 600 | **800** | 7.2:1 on white |
   | `warning-inverted` | dark | 600 | **700** `#9c7700` | 4.2:1, a toast icon (3:1) |

   - Unchanged: light `warning` 500, `on-warning` 950, the subtle steps 100/50, and all other dark warning roles. Every
     pair passes.
   - **The c-autocomplete and c-tree-select hint icons** change from `text-warning` (1.6:1 for yellow on white) to
     `text-on-warning-subtle`, the same ink c-alert's icon uses.
2. **Error seed is `#dd042a`**: hue 24°, cooler, with the same lightness and chroma as today.
3. **Vivid dark fills.** In dark mode:
   - `error` moves to error-400 `#fc3a44`, 5.1:1 under `on-error` (950);
   - `error-hover` moves to error-300.
   - This covers fills, borders, rings, the checkbox and radio indicators and icons. They need 3:1, and they get
     3.7:1 on the page surface.
   - A vivid outline inside a dark popover (slate-700) reads 2.8:1. This is accepted, because the error message
     carries the state; it is recorded.
4. **New public semantic token `on-surface-error`** for error text on a surface:
   - light: error-500 (5.1:1);
   - dark: error-300 `#ff7a76` (5.3:1 on the page and cards).
   - On menus and popovers (slate-700) it reads 4.0:1, the same as today's `text-error`. This is recorded as a known
     case for error text in an app's own c-popover content.
5. **c-menu-item's danger label uses the subtle pair**: `on-error-subtle` at rest, on hover over `error-subtle`, and in
   the keyboard-active state. It fails today at 4.0, 3.6 and 3.7:1; after the change it reads 9:1 in light mode and
   5:1 in dark mode. Its check icon uses the same ink.
6. **Chart slot 3 "gold" (`#b5901d`, 89°) stays.** ADR-0030's note gains one line: slot 3 shares the warning hue but is
   darker and duller (L 0.67, C 0.13 against L 0.85, C 0.17).
7. **The light filled-hover AA failures get their own plan**, `_plan/light-hover-contrast.md`, to be grilled next.
   White labels on the lighter hover fills read: primary 2.8, secondary 3.8, danger 2.5, accent 1.5 and link 1.2:1.
8. **ADR-0080** "Warning is yellow; error splits its dark fill from its text". ADR-0030, ADR-0034 and ADR-0079 get
   back-link lines; ADR-0079's `inverse-warning` step changes from 600 to 800.

Settled by convention:
- Text uses of `text-error` change to `text-on-surface-error`. Non-text uses keep `error` and go vivid in dark mode:
  borders, rings, indicators, icons and the ripple.
- The token comments carry the new numbers.

## Commit 1: `Fix(c-menu-item): The danger label reads at AA in both modes`

- **CMenuItem.vue:**
  - danger variant: `check` and `root` use `text-on-error-subtle`, and `hover:text-on-error-subtle`;
  - the `:host([data-active][data-danger])` style block uses `color: var(--c-on-error-subtle)`;
  - fix the stale comment "(error-600)".
- **Spec in CMenuItem.spec.ts:** a danger item's label is ≥ 4.5:1 at rest, hovered and keyboard-active, in both modes,
  using `contrastRatio` from `src/test/harness.ts`. It must fail before the change.
- Refresh the c-menu baselines; changeset (patch).

## Commit 2: `Feat(tokens): Warning is yellow`

- **Seed and ramps:** `src/theme/ramp.js` `DEFAULT_SEEDS.warning = '#ffc400'`, then `node scripts/generate-ramps.mjs`,
  which regenerates `tokens/theme/base.json`. `lint:ramp` keeps the two in step.
- **Token remaps** (decision 1):
  - `tokens/semantic/light.json`: `on-warning-subtle`;
  - `tokens/semantic/invariant.json`: `inverse-warning`;
  - `tokens/semantic/dark.json`: `warning-inverted`;
  - update the comments: the `_comment-status-on` numbers and the inverse comment.
- **Components:** CAutocomplete.vue and CTreeSelect.vue `infoIcon` change to `text-on-warning-subtle`.
- **Audit** (`scripts/audit-contrast.mjs`): add `on-<role>-subtle / surface` text pairs for the status families.
- **Specs:**
  - `src/theme/tokens.node.spec.ts`: warning and error fills sit ≥ 45° of OKLCH hue apart in both modes. Today they
    are 11° apart, so it fails before the change.
  - The c-autocomplete hint icon reads ≥ 3:1 in both modes.
- **Docs:** `customization.ts`'s "Inverse & scrim" table gains the four inverse rows ADR-0079 missed (`inverse-info`,
  `inverse-secondary`, `inverse-success`, `inverse-warning`), with `inverse-warning` at warning-800.
- **Changeset** (minor): "Warning is yellow (#ffc400) so it no longer reads like error."

## Commit 3: `Feat(tokens): A redder error with vivid dark fills; error text takes on-surface-error`

- **Seed:** `DEFAULT_SEEDS.error = '#dd042a'`, then regenerate the ramps.
- **dark.json:**
  - `error` → error-400, `error-hover` → error-300;
  - new `on-surface-error` → error-300;
  - update the long `_comment` (error now joins the status families on 400, and its text sits on 300).
- **light.json:** new `on-surface-error` → error-500. The light and dark files must keep matching keys.
- **Tailwind theme:** add `--color-on-surface-error: var(--c-on-surface-error);` to `src/styles/css/tailwind-theme.css`
  (the consumer export, ADR-0018).
- **Text uses → `text-on-surface-error`:**
  - CMessage root; CCheckbox `root` (its label);
  - CInput `root` and `required`; FormLabel `required`; FieldMessage root;
  - CProgressBar `details`; CFileUpload `status`;
  - CRadioGroup `items` text, while `--_c-radio-color` stays `var(--c-error)`.
- **Non-text uses keep `error`:** borders, rings, SelectionIndicator, the c-file-upload `fileIcon`, the ripple, and
  c-button danger.
- **Audit:**
  - `on-surface-error` over surface, surface-raised, surface-muted and surface-overlay (TEXT). The dark overlay pair
    prints 4.0:1; CI runs the audit as non-blocking.
  - `error / surface` (UI 3:1).
- **Specs** (they fail before, since the token doesn't exist):
  - an invalid c-text-field's message is `--c-on-surface-error` and ≥ 4.5:1 in both modes;
  - its outline is `--c-error`;
  - in dark mode, the two differ.
  - `buttonVariants.ts` already checks the danger fill against `--c-error` and checks AA, so it guards the vivid fill.
- **Docs and glossary:**
  - `customization.ts` neutral-ink table gains an `on-surface-error` row;
  - CONTEXT.md's **Semantic token** entry names `on-surface-error` as error text on a surface, distinct from the
    `error` fill.
- **Changeset** (minor): "Error is a cooler red, and dark-mode error fills are vivid; error text uses the new
  `--c-on-surface-error`."

## Commit 4: `Docs: Status colours in the records`

- **ADRs:** new `docs/adr/0080-…`, recording decisions 1–8 with the contrast numbers. Back-link lines in ADR-0030
  (the slot 3 note), ADR-0034 and ADR-0079.
- **Plans:**
  - `_plan/csc-ui-status-colours.md`: this plan plus the commit hashes;
  - `_plan/light-hover-contrast.md`: the parked hover failures, with the numbers and the candidate fixes (darken on
    hover, or dark labels on hover);
  - `_plan/csc-ui-4-stable-release.md`: one line noting that the status-colour retune also lands before 4.0.0.

## Verification

- **Per commit:**
  - `pnpm ui lint:ramp`, `lint:chart` (slots are frozen literals, so they're unaffected), `lint:contrast` (review the
    printed pairs), `lint:guards`;
  - `pnpm ui type-check`, `pnpm lint`, `pnpm format:check`.
- **Specs**, one file per run on Chromium:
  - CMenuItem, CAutocomplete, CTreeSelect, tokens.node, CTextField, CButton, CIconButton (the variants grid),
    CAlert, CStatus, CToast, CBadge, CCheckbox, CRadioGroup, CFileUpload, CProgressBar, CMessage, COtpInput;
  - each new spec is checked to fail against HEAD sources.
- **Visual baselines:** use the pixel-regen recipe (reference_visual_baseline_pixel_regen). Delete the PNGs of every
  spec that paints warning or error, rerun until green, pixel-diff against HEAD and restore the identical ones. Review
  the changed PNGs.
- **After commit 3:**
  - `pnpm build` and the React build;
  - the docs example smoke in every flavour (Vue, React, TypeScript, react-props), regenerating the changed docs
    screenshots the same way;
  - Firefox runs of the touched specs from the scratch Playwright install.
- **Hygiene:** gate each commit on tree counts and wait out `.git/index.lock`. Don't touch the Dockerfile or the four
  untracked `_plan` files. Never push.

## Commits (2026-11-04, `development`, unpushed)

- b47b065e `Fix(c-menu-item): The danger label reads at AA in both modes`
- be48a5c6 `Feat(tokens): Warning is yellow`
- a5336a33 `Fix(tokens): The Tailwind theme maps the button variants' inverse tokens`
- 8a665d63 `Feat(tokens): A redder error with vivid dark fills; error text takes on-surface-error`
- the records commit: ADR-0080, the ADR-0030 amendment, back-links in ADR-0034 and ADR-0079, these plans

## Deviations from the plan

- **An extra fix commit, a5336a33.** ae56c6ec had added four `inverse-*` tokens without mapping them in the consumer
  Tailwind theme or listing them on the customization page. A new node spec (`src/theme/tailwindTheme.node.spec.ts`)
  pins the theme to the semantic maps both ways; it failed on exactly those four.
- **The hue-distance spec lives in `CAlert.spec.ts`.** It measures the alerts' accent edges in both modes, where the
  plan had put it in `tokens.node.spec.ts`; the node spec covers the generated CSS cascade, not colour values.
- **The audit checks `on-surface-error` on surface, surface-raised and surface-overlay, not surface-muted.** Light
  error text reads 4.46:1 on the muted surface (as before), and no error text sits there. ADR-0080 records it.
- **The audit also checks every status tint's ink on the surface and the overlay**, not only on its tint.
- **Found and parked:** primary text on the `primary-subtle` tint reads 3.72:1 in dark mode (active option rows, menu
  highlights, in about nine components). Added to `_plan/light-hover-contrast.md`.
