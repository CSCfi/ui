# c-date-picker: design, docs, and implementation plan

## Context
`_todo/datepicker.md` asks for a date picker based on MD3's docked picker, styled like the rest of csc-ui. It needs:
- an anchored popover on desktop and a fullscreen panel on a narrow viewport (like autocomplete, select and tree-select);
- keyboard operation and typing in the field without opening the panel;
- a configurable format and week start;
- range selection and disabled dates.

No date component has ever existed, 3.x included. The only native option today is `c-text-field type="date"`. The grilling session settled the design below. After approval: save this plan to `_plan/c-date-picker.md` (per project convention), apply the glossary and ADR edits, then implement.

## Settled design
**Value and format** (becomes ADR-0057)
1. `value` is an ISO `YYYY-MM-DD` string or `null`. Under `range` it's `{ start, end }`: each end may be `null`, and both-null collapses to `null`.
2. `format` is a numeric token pattern (`d dd M MM yyyy` plus literal separators), used both to display and to parse. It's `@defaultable 'dd.MM.yyyy'`.
3. Parsing:
   - Day and month accept 1–2 digits.
   - Any of `. / - space` counts as a separator.
   - Years must be 4 digits.
   - Committed text is reformatted to `format`.
4. Names come from `texts`:
   - Keys: `months`, `weekdays`, `weekdaysShort`, `date(iso)` (a day's accessible name), `start`, `end`, `openCalendar`, `clear`, prev/next labels, `selectMonth`/`selectYear`, `unavailable`, `weekNumber`.
   - Any key not supplied comes from `Intl.DateTimeFormat(document.documentElement.lang)`, then from the English built-ins.
   - This is the library's first use of Intl.
5. `first-day-of-week` is 0–6 in `getDay()` numbering, `@defaultable 1`. `show-week-numbers` shows ISO weeks, `@defaultable false`.

**Disabling**
6. A date is disabled when any of these says so (OR):
   - `min`/`max` ISO attributes, which also bound navigation and the year list;
   - `disabled-dates`, a `(string | {start,end})[]` property;
   - `is-date-disabled`, an `(iso) => boolean` property.
7. A range may span disabled days. Only the ends must be enabled, and the gaps are shown inside the band.

**Typing and bad input** (bad input is a section of ADR-0057)
8. Typed text commits on Enter or blur only. Valid text emits the value; empty text emits `null`.
9. Unparseable, disabled or out-of-range text keeps the text as typed and emits `null`. It also sets `:state(bad-input)` and a read-only `badInput` property, and fires `change:text` (raw text, on every commit). The component never renders an error itself.
10. Range field: one `c-input` field box holding two `<input>`s, named by `texts.start` and `texts.end`. Each end commits and flags bad input on its own, and start > end is swapped.

**Panel** (becomes ADR-0058)
11. Opening:
    - Opened by a trailing calendar `c-icon-button` or Alt+↓, never by clicking or focusing the text.
    - `inputmode="numeric"`.
    - `clearable` works as in tree-select.
    - The same model applies on every viewport; a narrow viewport gets the fullscreen panel (`PanelHeadingRow` + grid).
12. The panel is `role="dialog"`, named by the field label. It traps a Tab cycle: month control → year control → arrows → grid (one roving tab stop). Escape closes it, it stays light-dismissable on desktop, and real DOM focus lands on the selected day, else today, else the nearest enabled day.
13. MD3 docked anatomy: `‹ Sep ▾ ›` and `‹ 2026 ▾ ›`.
    - `▾` swaps the panel body for an in-panel `listbox` of months or years, and a pick returns to the grid.
    - The year list is bounded by min/max, else today ±100 years, and centred when it opens.
    - These lists are **transient list panels**: hidden scrollbar and a peek, except in the fullscreen panel.
14. Grid keys (WAI-ARIA date-picker-dialog):
    - Arrows move ±1 or ±7 days; Home/End go to the week start or end.
    - PageUp/PageDown move a month; Shift+PageUp/PageDown move a year.
    - Enter or Space picks.
    - Disabled days are focusable but not pickable, marked `aria-disabled` and announced as unavailable.
    - Movement stops at min/max.
15. Commit on pick, with no Cancel/OK. In range mode, the first pick is a **pending start**:
    - it is shown and announced, but not emitted;
    - it is discarded on dismiss;
    - a preview band follows the hovered or focused day;
    - the second pick commits and closes.
16. `change:month` fires with `'YYYY-MM'` whenever the displayed month changes, open included, so consumers can load disabled dates lazily.
17. Visuals use MD3 shapes with csc semantic tokens:
    - 40px circular cells;
    - selected: `bg-primary text-on-primary`;
    - today: a 1px `primary` ring;
    - hover and focus: the primary tint pair;
    - range band: a `primary-subtle` strip;
    - disabled days: muted ink;
    - the panel paints `surface-overlay` with paired ink.
18. Events: `change`, `update:value` and `input` through `emitModelChange` (only on interaction), plus `change:text` and `change:month`.
19. No form association, matching the rest of the library. `c-text-field type="date"` stays, and the two usage docs cross-reference each other.

## Docs edits (after approval)
- **CONTEXT.md**:
  - Add a `### Date picker` section with these terms:
    - **Date picker** (avoid: datepicker, calendar, date field)
    - **Day grid**
    - **Displayed month**
    - **Month list / Year list**
    - **Pending start**
    - **Range band**
    - **Bad input** (avoid: invalid date, which is the consumer's validation)
  - Extend these existing entries to cover c-date-picker: **Transient list panel**, **Peek**, **Fullscreen panel** (the panel has no search input), **Value control**, **Control height**, **Custom state** (bad-input).
- **ADR-0057** `docs/adr/0057-date-values-are-iso-strings-with-a-numeric-format-pattern.md` covers items 1–4, 8 and 9. It should explain the rejected options: Date objects, a `locale` prop, month-name tokens, and a built-in error.
- **ADR-0058** `docs/adr/0058-c-date-picker-is-an-editable-field-with-a-dialog-grid.md` covers items 11–12. It should explain why this differs from the listbox fields (activedescendant, no trap) and from c-popover (never traps).

## Implementation
All paths are in `packages/csc-ui/src/components/c-date-picker/`.

- **`CDatePicker.vue`**:
  - Reuse `shared/useAnchoredPanel.ts` (pass `fullscreen: useNarrowViewport()`), `PanelHeadingRow.vue`, `emitModelChange`, `useHostEmit<CDatePickerEvents>`, `useAppDefault`, and `useStatusAnnouncer` (month change and pending-start announcements).
  - Wrap the internal `c-input` as CTreeSelect.vue:1-99 does, including the `data-hide-details` quirk and the forwarded field props. The trailing buttons go in `slot="post"`.
  - Prefix private type aliases with `CDatePicker` (tag-map collision hazard).
- **`dates.ts`** holds pure helpers:
  - ISO ↔ y/m/d with no `Date` timezone use (build via `Date.UTC`);
  - `format` and `parse` for the token set;
  - month-matrix generation honouring `first-day-of-week`;
  - ISO week number;
  - the `isDisabled` composition.
- Colocated files:
  - `dates.node.spec.ts`: parse and format tables, leap years, `31.02` rejection, week numbers, week start.
  - `usage.md`: the first paragraph is the description; add the cross-link to c-text-field.
- Register the tag in the entry. Types are exported and component-owned: `CDatePickerValue`, `CDatePickerRange`, `CDatePickerTexts`, `CDatePickerDisabledDate`.
- Docs examples go in `packages/csc-ui-documentation/app/examples/c-date-picker/`: basic, range, disabled-dates, format-and-week-start, texts (Finnish), lazy-month. Each needs all flavor variants (see `c-tree-select/` for the file set) and uses v-model; never `.prop`.
- Add a line to `packages/csc-ui-documentation/.../c-text-field` usage.md pointing to c-date-picker.
- Changeset: `@cscfi/csc-ui` minor, "Add c-date-picker".
- Leave `packages/csc-ui-react` alone; it's regenerated from the manifest.

## Verification
- `pnpm ui test -- c-date-picker` (one spec file per run, because of devcontainer OOM). `CDatePicker.spec.ts` covers:
  - typing and commit on blur/Enter;
  - bad input → `null` + `:state(bad-input)` + `change:text`;
  - Alt+↓ opens;
  - focus lands on the selected day, today, or the nearest enabled day;
  - the full key map, including disabled-focusable and min/max stops;
  - the Tab trap and Escape returning focus;
  - month and year list swaps;
  - a range two-click with the pending start discarded on dismiss;
  - typed half range;
  - start/end swap;
  - `change:month` on open and on navigation;
  - no emission on programmatic `value`;
  - fullscreen on a narrow viewport.
  Pin `texts`/`lang` and use a fake clock for "today".
- Conformance suites enrol the tag automatically (value control, anchored overlay, paired ink, mode scope). Fix the component rather than opting out.
- Visual baselines: `pnpm ui test:update` in the devcontainer, in light and dark, for the closed field, the open panel, a range band, and the year list. Review the PNGs.
- `pnpm ui lint` (tokens/a11y), `pnpm ui build` (strict manifest + API snapshot update), `pnpm --filter csc-ui-react build`, and the docs example smoke.
- Manual Firefox 140 ESR check of anchored placement (the ADR-0056 fallback) with the recipe from memory.
