# c-button, c-icon-button: a colour `variant` (before 4.0.0)

## Context

The user wants colour variants on the buttons, in the same batch as the renames that land before 4.0.0
(`_plan/csc-ui-4-renames-before-stable.md`, commits 57a91a5f..d805b84d, unpushed).

- **Variants:** `danger`, `success`, `warning`, `info`, `primary`, `secondary`.
- **Appearances:** every one (filled, outlined, ghost, text).
- **Default:** `primary` is built in, and an app can change it with `applyDefaults`.
- **Name:** the glossary already sets it aside. Its Appearance entry says "_Avoid_: Variant (reserved for a
  colour-intent axis …)".

What the code has today:
- c-button and c-icon-button have a `danger` boolean that turns only the filled look red (the `error` family).
- Everything else is hard-wired to `primary`.
- `inverted` uses the mode-invariant `inverse-*` family, which has only `inverse-primary` and `inverse-error`.
- Neither tag is defaultable.
- In light mode, white text fails AA on three fills: on success 3.02:1, on info 4.28:1, on warning 3.16:1. On
  their hover fills it is 1.9–2.3:1.

## Decisions (grill, 2026-11-03)

1. **`danger` becomes a deprecated alias of `variant="danger"`** (ADR-0074 path, removed in 5.0). `variant` wins when
   set. `danger` with outlined, ghost or text now turns red; before, those looked primary.
2. **Dark labels on the light-mode success, info and warning fills.** In `tokens/semantic/light.json`:

   | Token | New value | At rest | On hover |
   |---|---|---|---|
   | `on-success` | `success-950` | 5.91:1 | 9.57:1 |
   | `on-warning` | `warning-950` | 5.82:1 | 9.48:1 |
   | `on-info` | `black` | 4.91:1 | 9.22:1 |

   Their only current users are the warning badges (c-badge, and c-icon-button's `badge`), which go from 3.16:1 to
   5.82:1.
3. **Ink for outlined, ghost and text** is `on-<role>-subtle` for every variant, primary included (the rule
   c-alert uses). It also colours the outline ring and the focus ring; the filled look keeps its focus ring in
   the fill colour.
   - The plan first kept the role itself for primary and error. The AA matrix spec then showed:
     - error reads 4.44:1 on its own ghost tint;
     - today's dark primary reads 4.25:1 on the ghost tint and 3.76:1 on any hover tint.
   - The user chose the subtle ink for all (2026-11-03). Primary's lighter buttons are now a darker teal in light
     mode (primary-700) and a lighter one in dark mode (primary-200).
4. **Inverted keeps the variant on the filled look.** New invariant tokens:

   | Token | Value | Contrast on white |
   |---|---|---|
   | `inverse-secondary` | secondary-600 | passes AA |
   | `inverse-success` | success-700 | 6.49:1 (600 only reaches 4.38:1) |
   | `inverse-info` | info-600 | 5.87:1 |
   | `inverse-warning` | warning-600 | 4.61:1 |

   An inverted filled button is `inverse-surface` with `inverse-<role>` text. Inverted outlined, ghost and text stay
   `inverse-on` white for every variant.
5. **The pressed (`active`) fill follows the variant.**
   - c-button-group leaves `variant` alone on its slotted buttons, so a group may mix colours.
   - c-tab-buttons writes `button.variant = 'primary'`, because its single sliding pill (`bg-primary`) has one colour.
6. **An app default reaches only the app's own buttons.** Every c-button or c-icon-button the library renders in its
   own shadow DOM sets `variant="primary"`, and an instance value beats the app default. The 12 components:
   c-autocomplete, c-color-picker, c-data-table, c-date-picker, c-navigation-button, c-pagination, c-select,
   c-side-navigation, c-tabs, c-tag, c-time-picker, c-tree-select.
7. **`secondary` is the plum brand family** (`--c-secondary`): a colour, not an emphasis level. Emphasis stays with
   `appearance`.
8. **ADR-0079** "Buttons pick a colour with variant" records 1–7 with the contrast numbers. ADR-0048 and ADR-0074 get
   a back-link line.

Settled without a question (conventions):
- **Types:** both tags get the prop. `CButtonVariant` and `CIconButtonVariant` are
  `'danger' | 'info' | 'primary' | 'secondary' | 'success' | 'warning'`, exported from `src/index.ts`.
- **App defaults are per tag** (ADR-0048): `applyDefaults({ 'c-button': { variant }, 'c-icon-button': { variant } })`.
- **Danger vs error:** `danger` names a destructive action and maps to the `error` family. c-alert, c-status and
  c-toast keep `error` for a status. c-menu-item keeps its own `danger` boolean, since it is not a button.
- **Bad values:** an unknown `variant` string falls back to `primary`, the same guard `size` uses.
- **Hover:** the inverted filled hover tint is `/15` for every variant. Inverted danger was `/10`.
- **c-icon-button inverted danger:** it used to keep its red fill. It now follows c-button's inverted look: white with
  red text.

## Glossary (`CONTEXT.md`)

- **New entry, Variant** (`c-button`, `c-icon-button`):
  - Definition: the colour a button takes, set by `variant`. `primary` is the built-in default, and an app can set
    its own default.
  - Values: `secondary` (the plum brand family: a colour, not an emphasis level), `success`, `info`, `warning`, and
    `danger` (a destructive action, drawn in the `error` family).
  - It combines with every **appearance** and with `inverted`.
  - _Avoid_: color (c-icon's free CSS colour), intent, tone, type (the native button type; c-alert's status).
- **Appearance entry:** "`variant` and `inverted` are separate axes that combine with it". The deprecation note
  gains `danger`.
- **Flagged ambiguities:** add "Variant" with three senses: (a) the button colour **variant**, (b) the docs'
  **example variant**, (c) a tailwind-variants variant. Say "variant" only for (a), "example variant" for (b), and
  "tv variant" for (c).

## Commit 1: `Fix(tokens): Dark labels on the light-mode success, info and warning fills`

- **Tokens:** change the three `on-*` mappings in `tokens/semantic/light.json` (decision 2). After this,
  `scripts/audit-contrast.mjs` should report three failures (accent ×2, nav hover), down from six.
- **Test helper:** add `contrastRatio(fg, bg)` to `src/test/harness.ts`.
  - Tokens come out as `oklch()`, so the helper resolves each CSS colour through a 1×1 canvas `fillStyle` to sRGB.
  - It then applies the WCAG formula.
- **New spec `src/components/c-badge/CBadge.spec.ts`** (c-badge has none): the count's ink against its fill is
  ≥ 4.5:1 in both modes. It must fail before the token change.
- **Visual baselines:** rerun c-tag, c-tab, c-icon-button and c-toasts, the specs that show a warning badge. Rewrite
  only the PNGs that changed, and review them.
- **Changeset** `.changeset/status-fill-dark-labels.md` (patch, both packages): "`--c-on-success`, `--c-on-info` and
  `--c-on-warning` are dark in light mode, so text on those fills meets WCAG AA, e.g. the warning badge count."

## Commit 2: `Feat(c-button, c-icon-button): A variant prop picks the colour; danger is deprecated`

### `src/shared/appDefaults.ts`

`useAppDefault`'s resolver gains an optional 4th argument: a mapper for a replaced prop of another shape:
`appDefault('variant', 'primary', 'danger', dangerAsVariant)`.

- The mapper receives the replaced name's raw instance value, as an attribute string or a property.
- `dangerAsVariant = (v) => (coerceBoolean(v) ? 'danger' : undefined)` lives in a new `src/shared/buttonVariant.ts`,
  beside `buttonAppearance.ts`.
- Resolution order: instance `variant` → instance `danger` → app default `variant` → `'primary'`.
- `danger="false"` and an absent `danger` both fall through.
- `lint.mjs` also accepts a trailing comma, because oxfmt adds one when the call wraps.
- `replaces` is typed `keyof Bucket<T>`, but `danger` is not defaultable. With a mapper it accepts any prop name,
  and the app-default layer skips the replaced name.
- `scripts/analyzer/lint.mjs:342`: widen the appDefault regex to accept an optional 4th identifier argument.

### CButton.vue and CIconButton.vue

- **Prop:** `variant?: CButtonVariant` with `@defaultable 'primary'`, declared `undefined` in `withDefaults`.
- **Deprecation:** `danger` gets `@deprecated Use \`variant="danger"\`.`
- **Colours come from internal custom properties**, set per variant in the tv `variant` map on `root`, instead of
  one compound per colour:
  - `--_c-button-fill`, `--_c-button-fill-hover`, `--_c-button-on-fill` (role, role-hover, on-role; danger uses
    `error`);
  - `--_c-button-ink` (decision 3);
  - `--_c-button-inverse` (`inverse-<role>`).
- **Appearance compounds read the variables**, for example filled is
  `bg-(--_c-button-fill) text-(--_c-button-on-fill) hover:bg-(--_c-button-fill-hover)`.
  - Ghost: `bg-(--_c-button-fill)/8`, with `/15` on hover and `/22` while pressed.
  - Outlined: `ring-(--_c-button-ink)`.
  - Focus ring: `focus-visible:outline-(--_c-button-ink)`.
  - Inverted filled: `text-(--_c-button-inverse)`.
- **Removals:** drop the `danger` tv flag and its compounds, including the disabled ones. The disabled look stays
  neutral for every variant.
- **Pressed fill:** the active compound falls back to the variables
  (`var(--_c-button-active-bg, var(--_c-button-fill))`, and the same for fg and hover).
- **Primary must stay pixel-identical.** The existing c-button and c-icon-button baselines must pass unchanged, which
  makes them a regression guard.

### Other library sources

- c-pagination's next-page button still used the deprecated `text` boolean, missed by d37b24bf. It now uses
  `appearance="text"`.
- `CTabButtons.vue` sets `button.variant = 'primary'` in its button setup.
- The 12 internal users (decision 6) add `variant="primary"` to every c-button and c-icon-button they render.
- `src/shared/appDefaults.spec.ts`: add `c-button` and `c-icon-button` to the pinned `DEFAULTABLE_PROPS` list.

### Specs (each must fail before the change)

- **Variant colour:** each variant changes the computed fill (filled) or ink (outlined, ghost, text). Unset is
  `primary`.
- **Old name:** `danger` still selects danger. `variant` beats `danger`. `danger="false"` does not select danger.
- **App default:** an app default `variant` applies to a mounted button, and an instance `danger` beats it.
- **Contrast:** label ≥ 4.5:1 for every variant × appearance in both modes, using `contrastRatio`. Filled is
  measured against its fill. Outlined, ghost and text are measured against the surface.
- **Inverted:** filled shows `inverse-<role>` text on white.
- **Pressed:** a pressed button fills with its variant.
- **c-tab-buttons:** pins `primary` even under an app default.
- **Visual baseline:** one variants × appearances grid per tag, in both modes (`matchScreenshotInBothModes`).

### Tokens, docs and generated files

- **Tokens:** add the four `inverse-*` tokens to `tokens/semantic/invariant.json`. Add
  `inverse-<role> / inverse-surface` TEXT pairs to `audit-contrast.mjs`.
- **Docs canons:** new `c-button/variants` and `c-icon-button/variants`, in all four flavours. Each is a grid of
  variants × appearances. Add a SCREENSHOT entry for `c-button-variants` in `tests/examples.spec.ts`.
- **Canon migration:** the c-button `appearances` and c-icon-button `basic` canons switch to `variant="danger"`.
  c-modal `basic` does too, if its `danger` is on a button.
- **usage.md:** c-button and c-icon-button get a "## Variants" section, which mentions the app default and the dark
  labels.
- **Regenerated files**, in this commit:
  - `api.snapshot.json`, both tags;
  - `api.entry.snapshot.json`, for the new types;
  - `packages/csc-ui-react/src/components.ts`.
- **Changeset** `.changeset/button-variant.md` (minor, both packages).

## Commit 3: `Docs: Button variants in the migration guide and the records`

- **`migration.ts`:** under "Renamed attributes that still work", add c-button and c-icon-button `danger` →
  `variant="danger"`.
- **ADRs:** add `docs/adr/0079-buttons-pick-a-colour-with-variant.md`, plus back-link lines in ADR-0048 and ADR-0074.
- **Glossary:** the edits listed above, unless they already went into commit 2.
- **Plans:**
  - copy this plan to `_plan/csc-ui-button-variants.md`, with the commit hashes;
  - add a line to the renames plan;
  - in `_plan/csc-ui-4-stable-release.md`, extend the RC exception note to cover variants.

## Verification

- **Per commit, Chromium:** run the touched specs one file at a time: CBadge, CButton, CIconButton, CButtonGroup,
  CTabButtons, appDefaults, and the 12 internal users' specs. Then `pnpm ui type-check`, `pnpm lint` (API guard
  0 breaking, example parity, tokens), `pnpm format:check` and `pnpm lint:contrast`.
- **After commit 2:**
  - `pnpm build` and the React build;
  - the docs example smoke (Vue, React, TypeScript, react-props);
  - the dist manifest shows `variant` as defaultable and `danger` as deprecated;
  - the touched specs on Firefox, from the scratch Playwright install.
- **Commit hygiene:** gate each commit on tree counts. Commits stay local; the user pushes.

## Commits (local only, built 2026-11-03)

1. d95be1d4 `Fix(tokens): Dark labels on the light-mode success, info and warning fills`
2. bf11eba7 `Chore(docs): Refresh the stale c-alert types screenshot`. c0421b9b had dropped the neutral alert's icon,
   and the 1% tolerance hid it. Found while regenerating the canon screenshots.
3. ae56c6ec `Feat(c-button, c-icon-button): A variant prop picks the colour; danger is deprecated`
4. `Docs: Button variants in the migration guide and the records`

How the baselines were refreshed: every baseline of a component showing a text, ghost or outlined button was deleted
and regenerated, then pixel-compared with HEAD. Only the PNGs that changed were kept: 24 component and 14 docs
screenshots. c-color-picker's `open-panel-alpha` varies by about 20 px between runs (alpha checkerboard noise), so it
stayed as committed.
