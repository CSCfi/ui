# The 4.x renames land before 4.0.0

## Context

The stable-release plan (D13, `_plan/csc-ui-4-stable-release.md`) deferred seven renames of 3.x names to a 4.x minor:
add the new name, mark the old one `@deprecated`, remove it in 5.0 (ADR-0074). 4.0.0-rc.1 shipped without them. On
2026-11-03 the user chose to do all of them, and the deprecation mechanism they need, before 4.0.0, so the first stable
release already teaches the final names. The old names keep working through 4.x, so nothing breaks for anyone.

Decided 2026-11-03:
- All seven renames plus the mechanism (#36) go in before 4.0.0. The "4.x additive only" list (texts, parts,
  `autoheight` prop, …) stays in 4.x.
- c-toasts `absolute` → **`contained`** (named for the behaviour, as the glossary's Static rule asks); it is not a
  placement, so it does not fold into `position`.
- c-sub-navigation-item `active` → **`current`** too, so both nav items mark the page the same way.

## Rules every rename follows

- **One which-wins rule:** the new prop has **no built-in default** and **wins when set** (`new ?? old`). This holds
  for the booleans too: they declare `undefined` in `withDefaults`, so Vue leaves an absent one `undefined` instead of
  casting it to `false`, and an explicit `false` on the new name beats `true` on the old. In 5.0 the old name goes and
  the new one takes the old built-in default.
- The old prop's JSDoc gets `@deprecated Use \`<new>\` …`. No runtime warning (#36: the bundle has no dev mode, and the
  example smoke fails on any `console.warn`).
- The library itself, the docs canons (all four flavours) and usage.md use only the new names.
- Each rename is one `Feat(` commit with its own changeset (minor, both packages), a behaviour spec that fails before
  it (new name works; old name still works; new wins over old), and its `api.snapshot.json` change. The API guard
  must classify every diff as additive.

## 1. Deprecation mechanism (#36)

- **Analyzer** (`scripts/analyzer/script-api.mjs`, `cem.mjs`): read a `@deprecated <message>` member tag on props;
  emit CEM `deprecated: "<message>"` on the field and the attribute. The IDE-data generators mark only deprecated
  tags and methods, so `ide-data.mjs` leads a deprecated attribute's description with `@deprecated <message>` (both
  formats) and sets web-types' own `deprecated` field.
- **Tag map** (`tag-map.mjs`): append `@deprecated <message>` to the member's JSDoc, so TypeScript users and the
  React wrappers (props come from the element type) see the strikethrough.
- **Lint** (`lint.mjs`): a `@deprecated` tag needs a message that names the replacement in backticks.
- **API guard** (`check-api-breaks.mjs`): adding `deprecated` is not a break; verify against a snapshot diff.
- **Docs site** (`useManifest.ts` + the API table): a "Deprecated" mark and the message on the row; deprecated rows
  sort after the live ones.
- **Glossary:** **Deprecated** (API): a public name that keeps working until the next major, marked in the manifest,
  IDE data and types, with its replacement named.

## 2. c-button, c-icon-button: `appearance` (#29)

- `appearance?: 'filled' | 'outlined' | 'ghost' | 'text'` (exported `CButtonAppearance`; c-icon-button reuses it).
  Resolved appearance = `appearance ?? (text ? 'text' : ghost ? 'ghost' : outlined ? 'outlined' : 'filled')`. The
  boolean order matches today's tv compound order; confirm it against CButton.vue:254-330 before writing it down.
- tv variants key off the resolved appearance; `danger` and `inverted` stay separate axes.
- c-button-group writes `button.appearance = 'text'` (CButtonGroup.vue:439) instead of `text = true`.
- Internal uses (CNavigationButton and others) switch to `appearance`.
- Docs: the canon `c-button/variants` becomes `appearances` (the visual baselines move with it), every canon using the
  booleans migrates (69 files), and the usage docs are updated.
- Glossary **Appearance** (c-button): filled, outlined, ghost, text. _Avoid_: variant.

## 3. Fields: `hide-message` (#30)

- Tags: c-text-field, c-number-field, c-select, c-autocomplete, c-tree-select, c-date-picker, c-time-picker,
  c-color-picker, c-file-upload (all defaultable), plus c-checkbox, c-radio-group, c-otp-input. **Not** c-pagination
  or c-progress-bar: there `hide-details` hides the `details` part ("`hide-<part>` hides that part").
- Defaultable: `hideMessage` joins `CAppDefaults`/`DEFAULTABLE_PROPS` on the nine tags; `hideDetails` stays accepted
  there (deprecated).
- Resolution per layer across both names: instance (new: attribute, property; then old) → app default (new, then old)
  → built-in `false`. A new helper beside `useAppDefault` resolves a name pair, so an app default `hideDetails: true`
  with an instance `:hide-message="false"` shows the message.
- The internal plumbing (`data-hide-details` to c-input, FieldMessage, TypedField) keeps its names: it is not API.
- Glossary **Message line**: the hint/error line under a field (`message` part, `hide-message`). _Avoid_: details.

## 4. c-spinner, c-loader: `thickness` (#31)

- `thickness?: number`; stroke = `thickness ?? width` (`width` keeps its built-in default: 2 on c-spinner, 4 on
  c-loader). Matches c-progress-circle's `thickness`.

## 5. c-toasts: `position` and `contained` (#32)

- `position?: CToastsPosition = 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'`, the
  overlays' words with the same physical meaning (start = left, end = right; `positionArea.ts`). Resolved: `position`
  when set, else `vertical` + `horizontal` (defaults `bottom` + `center` unchanged).
- `contained?: boolean`; resolved `contained ?? absolute`.
- The host placement classes stay internal; they follow the resolved values.
- Glossary **Contained** (toasts). _Avoid_: absolute.

## 6. c-side-navigation-item, c-sub-navigation-item: `current` and `expanded` (#33)

- c-side-navigation-item: `current?: boolean` (a leaf is the current page: `aria-current="page"`) and
  `expanded?: boolean` (a parent shows its sub-items: `aria-expanded`). Resolved `current ?? active` on a leaf,
  `expanded ?? active` on a parent; the active styling follows the resolved state.
- c-sub-navigation-item: `current?: boolean`, resolved `current ?? active`.
- c-side-navigation's accordion and a nested parent's own toggle write `expanded` instead of `active`. Since a written
  `expanded` wins, an old `active` binding on a parent still seeds the first state and the accordion still collapses it.
- The page still owns the current page (80f1a92b): nothing writes `current`.
- Glossary: the side-nav entries say current/expanded; **Active** stays c-button's pressed state only.

## 7. c-card: `show-fullscreen`

- `showFullscreen?: boolean`, resolved `showFullscreen ?? fullscreen`. ADR-0065's `show-*` naming. The methods
  `enterFullscreen`/`exitFullscreen` are unchanged.

## 8. c-slider: `tick-labels`

- `tickLabels?: boolean`, resolved `tickLabels ?? labels`; it sits beside `ticks`, apart from `label`.

## 9. Docs and records

- Migration guide: a "Renamed in 4.0, old name still works" section listing old → new for all of the above, with a
  note that they go in 5.0.
- ADR-0074: a note that the D13 4.x renames landed in 4.0.0 itself, deprecated from the first stable release.
- `_plan/csc-ui-4-stable-release.md`: D13's 4.x list points here; phase 6 keeps only the additive list.

## Commits (local only, built 2026-11-03)

1. 57a91a5f `Feat(analyzer): Mark deprecated props in the manifest, IDE data and types`
2. d37b24bf `Feat(c-button, c-icon-button): An appearance prop replaces outlined, ghost and text`
3. 6e8ce6d3 `Feat(fields): hide-message replaces hide-details`
4. 4964cd27 `Feat(c-spinner, c-loader): thickness replaces width`
5. e60e8493 `Feat(c-toasts): position replaces vertical and horizontal, contained replaces absolute`
6. 71cc4493 `Feat(c-side-navigation-item, c-sub-navigation-item): current and expanded replace active`
7. a2825e94 `Feat(c-card): show-fullscreen replaces fullscreen`
8. 64d65267 `Feat(c-slider): tick-labels replaces labels`
9. `Docs: The renamed props in the migration guide and the records`

Each Feat commit has its own changeset and specs that fail on the previous commit's source. The API guard reports
every change as an addition (0 breaking).

Found on the way:
- c-button-group now sets `appearance = 'text'`, which wins, so a slotted `outlined` button no longer keeps its
  outline inside a group (before, `outlined` beat the group's `text`). The group owns its buttons' look.
- c-checkbox, c-otp-input and c-card kept a Boolean attribute written as `"false"` as a truthy string; the resolved
  new/old pair is coerced now, so `hide-message="false"`, `hide-details="false"` and `show-fullscreen="false"` work.
- c-spinner and c-radio-group had no spec; each has one now.

## Verification

- Per commit: the touched components' specs on Chromium, `pnpm ui type-check`, `pnpm lint` (API guard, migration guard,
  example parity), `pnpm format:check`.
- At the end: `pnpm build`, the React build, the docs example smoke for the touched canons (Vue, React, TypeScript),
  the touched specs on Firefox, and the dist manifest showing `deprecated` on every old name.

## Followed by

- The buttons' colour `variant` (2026-11-03), which deprecates `danger` the same way:
  `_plan/csc-ui-button-variants.md`, ADR-0079.

## Release

- rc.2 can ship now with the c-tabs fix (5fd35a8d); these renames then go out as rc.3. MyCSC (on rc.1, branch
  `csc_ui_rc`) can switch names whenever it likes; nothing forces it before 5.0. Note that its `ui.css` styles some
  c-* hosts by attribute, so renaming e.g. `c-button[outlined]` needs the CSS changed too.
