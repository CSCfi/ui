# c-date-picker `type="month"`: pick a year and a month

Decided in a grilling session on 2026-10-01. The decisions are in ADR-0063 (Proposed) and `CONTEXT.md`, which
covers the Date picker, Month list, **Displayed year**, Pending start and Range band.

## Context

Apps need a month field, such as a billing or reporting period. c-date-picker already has everything a month field
needs: the typed field and its mask, `range`, `min`/`max`, the texts, the fullscreen panel, and the month and year
lists. `type="month"` reuses all of it. The value is `'YYYY-MM'`, and the panel opens on the month list. Date mode
must stay byte-for-byte unchanged behind its existing 44 specs and 4 baselines.

## Rules (ADR-0063)

- **Prop:** `type: 'date' | 'month'`, default `'date'`. It is not an app default.
- **Value:**
  - The value is `'YYYY-MM'`, or `{ start, end }` of those under `range`, with the date null rules.
  - A full date given in month mode is read by its month, with no emission.
  - In date mode, a `'YYYY-MM'` value shows as empty.
- **Format:** derived from `format` by dropping the day token and the separator beside it. A pattern with no day
  token is used as given. Typing and lenient reading work as for dates.
- **Panel:**
  - It opens on the month list of the displayed year, with the month control hidden.
  - The year arrows page the year, and the year list returns to the month list.
  - A pick commits and closes the panel.
  - PageUp/PageDown in the month list page the year, keeping focus on the same month.
- **Ranges:** the first pick is a pending start and the list stays open. The year can be paged between the picks.
  The second pick completes the range and closes the panel. Reversed picks swap, and the rows between the ends get
  the band.
- **Disabling:**
  - `min`/`max` accept `'YYYY-MM'` or a full date, which counts by its month.
  - A month is disabled when all its days are ruled out by `disabled-dates`/`is-date-disabled`.
- **Events:** no `change:month` in month mode, and no new event.

## Phase 1: month helpers in `dates.ts` (node-tested, done)

All of this goes into `src/components/c-date-picker/dates.ts`, next to the date helpers.

- `isIsoMonth(v)`: `/^\d{4}-(0[1-9]|1[0-2])$/`.
- `toMonth(v)`:
  - an ISO month → itself;
  - an ISO date → `monthOf`;
  - anything else → `null`.
  - The value reader and the bounds both use it.
- `monthPattern(pattern)`:
  - Drop the `d`/`dd` token, plus the literal after it, or before it when the token is last:
    - `dd.MM.yyyy` → `MM.yyyy`
    - `yyyy-MM-dd` → `yyyy-MM`
    - `MM/dd/yyyy` → `MM/yyyy`
    - `d. M. yyyy` → `M. yyyy`
  - A pattern that already has exactly one month and one year token and no day is returned as given.
  - Otherwise fall back to `MM.yyyy`.
- `isValidMonthPattern(pattern)`: exactly one month token and one year token, and no day token.
- `formatMonth(month, pattern)`:
  - Reuse `formatDate(firstOfMonth(month), pattern)`.
  - Confirm `tokenize`/`formatDate` work when the pattern has no `d`. They should, because each token is mapped on
    its own.
- `parseMonth(text, pattern)`: the month counterpart of `parseDate`, two fields in pattern order.
  - Lenient like dates: a month takes 1–2 digits, and any of `. / - space` separates.
  - A bare 6-digit run splits by the token widths (`032026` → `2026-03`).
  - The year needs 4 digits.
  - Factor out the shared field-splitting from `parseDate` if that stays readable. If not, duplicate the
    ~20 lines and note why.
- `compileDateMask(pattern)`: check that it already copes with a day-less pattern. The month slot's
  `closesAfter: value > '1'` is already there. If it doesn't, generalise it rather than add a second compiler.
- **Month rules:**
  - `monthOutOfRange(month, bounds)` compares the bounds through `toMonth`.
  - `isDisabledMonth(month, rules)` is true when the month is out of range, or when every day of it is disabled by
    `isDisabledDate`. The day check is at most 31 predicate calls a month, 372 per list render. That's fine, but
    stop at the first enabled day.
- **`dates.node.spec.ts`:** the new helpers, including:
  - pattern derivation for the four common patterns, plus a garbage pattern;
  - parse leniency;
  - the disabled-month rule:
    - a weekend predicate disables nothing;
    - a span covering July disables July;
    - a `min` in the middle of a month allows that month.

## Phase 2: the component (`CDatePicker.vue`, done)

1. **Props and types:**
   - `type?: 'date' | 'month'`, documented with a tag-only docblock (ADR-0026).
   - A host-attribute-safe `monthMode = computed(() => props.type === 'month')`.
   - Widen the `CDatePickerValue`/`CDatePickerRange` docs to say `'YYYY-MM'` under month mode. The TS type stays
     `string`-based.
   - Check how the analyzer emits the new union prop, and regenerate the tag map and API snapshot.
2. **Field codec:** switch on `monthMode`.
   - `pattern` → `monthPattern(formatResolved)`.
   - The mask is `compileDateMask(pattern)`.
   - Codec:
     - `format` → `formatMonth`;
     - `isValue` → `isIsoMonth`;
     - `isUsable` → `!isDisabledMonth`;
     - `parse` → `parseMonth`.
   - `value: () => normalise(props.value)`, so a full date reads by its month with no emission. Check
     `useTypedField` emits only on commit; it does (`commitValue`).
   - `reversed: 'swap'` keeps working on `'YYYY-MM'` strings, which compare correctly.
3. **Bounds:**
   - `bounds` reads `toMonth` in month mode.
   - `yearSpan` uses `fromIso(firstOfMonth(...))` or a month-aware year reader.
   - `monthInBounds` and the year list disable years outside the bounds.
4. **Views:**
   - A `homeView = computed(() => (monthMode ? 'months' : 'days'))`.
   - `onOpened` sets `view = homeView`, and in month mode lands the list. The displayed year is the value's year
     (the start, or the last-typed end under range), else today's, clamped to the bounds. `listIndex` is the
     selected month, else today's month, else the nearest enabled month.
   - Skip `setMonth`'s `change:month` emit in month mode: either guard `emit` or keep a separate displayed-year ref.
     A ref of its own is clearer, because it is the glossary's **Displayed year**.
   - The header hides the month control in month mode (`v-if`, not the `hidden` variant, so it leaves the tab
     order). The year arrows page the displayed year while the list is shown. Today they're hidden outside
     `'days'` (`ui.arrow({ hidden: view !== 'days' })`), so month mode shows them on the month list.
   - `toggleView('years')` and `pickOption` on a year return to `homeView`, not `'days'`. This is a fade, as now.
5. **Picking in the month list (month mode):**
   - `listOptions` months: `selected` is the committed value's month in the displayed year. Under range, the
     pending start, or both ends. `disabled` is `isDisabledMonth`.
   - Accessible name: the month name plus the year (`"March 2026"`) through an `aria-label`, because the displayed
     year is outside the list. Add it to the option only in month mode. Use the existing `texts` month names and a
     template that needs no new text key.
   - `pickOption` in month mode:
     - single → `commitValue('YYYY-MM')`, then close and return focus;
     - range → the first pick sets `pendingStart` (announced through `useStatusAnnouncer` like days); the second
       commits `{ start, end }`, swapped when reversed, and closes.
   - Dismissing the panel discards the pending start, as now.
   - The band: rows between the pending start and the focused or hovered month, or between the committed ends. Use
     a `band` row variant reusing `bg-primary-subtle`, with the ends rounded. It applies within the displayed year,
     and the band continues across year pages, because it compares `'YYYY-MM'` strings.
6. **Keyboard (`onListKeyDown`, month mode only):**
   - PageUp/PageDown page the displayed year, with focus kept on the same month index.
   - Stop at the bounds.
   - Disabled months stay focusable, as disabled days do. Check that the current list behaviour skips nothing.
   - Enter/Space pick, as now.
7. **Fullscreen:** the month list fills the body (`list: 'absolute inset-0'` already). Check the heading row and the
   fade, which need no change.

## Phase 3: specs, docs, baselines (done)

Specs in `CDatePicker.spec.ts`, in a new `describe('type="month"')`:

- Opens on the month list for the value's year, with focus on the value's month, no month control, and the year
  arrows shown.
- A click commits `'YYYY-MM'` and closes. Enter does the same. Escape closes with no change.
- PageUp/PageDown page the year with focus kept. The year list returns to the month list.
- Typing:
  - `3.2026` commits `'2026-03'` under the derived `MM.yyyy`;
  - `format="yyyy-MM-dd"` derives `yyyy-MM`;
  - `13.2026` is bad input;
  - a month outside `min`/`max` is bad input.
- `value="2026-03-15"` shows `03.2026` and emits nothing. A pick then emits `'2026-03'`.
- Disabling:
  - `min="2026-03-15"` keeps March enabled and February disabled;
  - a `disabled-dates` span covering July disables July;
  - `is-date-disabled` for weekends disables nothing.
- No `change:month` in month mode (`recordEvents`).
- Range:
  - the first pick is pending (no emission, list open, announced);
  - paging the year keeps it;
  - the second pick commits and closes;
  - reversed picks swap;
  - the band rows carry the variant;
  - dismissing discards the pending start.
- Fullscreen: opens on the month list.
- Conformance:
  - check that `kinds.ts` value recipes still pass (date mode);
  - add a month-mode value recipe only if the suite supports per-tag variants. If it doesn't, leave it and note it.

Baselines (`matchScreenshotInBothModes`), one file per run with `--update` last:

- New baselines: `month-panel` and `month-range-band`, in light and dark.
- Pixel-diff the existing date baselines against HEAD (pngjs). They must not change.

Docs and examples:

- `usage.md`: a "Months" section covering the value, the format derivation, the panel, PageUp/PageDown, ranges, the
  disabling rule and no `change:month`, with a cross-link from "Native date input" to `type="month"`.
- Docs examples: `app/examples/c-date-picker/month.*` in all 5 flavors, which the parity script checks. Use v-model
  and explicit imports, never `.prop`. Add a range variant only if the page reads better with it.
- Generated files: run `docs:tag-map`, update the API snapshot (`-u` on the snapshot spec), and run the React build.

Finishing:

- **ADR-0063:** set the status to Accepted.
- **Changeset:** minor for both packages: "c-date-picker `type="month"` picks a year and a month (`'YYYY-MM'`),
  with ranges, bounds and the derived format."
- **Commit:** one `Feat(c-date-picker)` commit, only when asked.

## Verification

- `pnpm ui test:node` covers `dates.node.spec`, the snapshots and the tag map.
- Browser, one file per run: `CDatePicker.spec.ts`, then the conformance suites filtered to `c-date-picker`.
- `type-check`, `lint`, the csc-ui build, the React build and the docs example smoke.
- Manual: the month list in the docs dev server at desktop and phone widths, and the range band across a year page.

## Risks

- **Option names:** month options get an `aria-label` with the year. Confirm that date mode's month list keeps its
  current names (no year), so the date specs stay unchanged.
- **`type` on a custom element:** check that Vue's defineCustomElement and the React wrapper pass `type` through
  without colliding with anything on HTMLElement. HTMLElement has no `type` property, but the generated wrapper
  should be checked.
- **Predicate cost:** a consumer's expensive `is-date-disabled` now runs up to 372 times per month-list render.
  Stopping at the first enabled day keeps the common case to one call per month. Note it in `usage.md`.

## Revision: step flow (2026-10-01)

The first build above (displayed year with arrows) was confusing in use. It is replaced by a month step, then a year step, with labels. The full revision plan follows.


### Context

You found the first month mode (ADR-0063, built 2026-10-01 and uncommitted) confusing. The panel opened on a month
list under a year header with ◀ year ▶ arrows, and the year was a setting you had to notice and change first.

The new flow asks one question per step, in the order people say a month: the month first, then the year. Ranges
repeat the same steps, with labels above each list so the user knows which end and which part they are picking.

This reverses one ADR-0063 decision, "The panel opens on the month list for the displayed year, and the header's
month control is hidden". It also accepts the two-step cost that ADR-0063 used to reject "year list first". ADR-0063
is uncommitted and dated this week, so it is amended in place.

### Decisions (from the grilling session)

1. **Flow:** the panel opens on the 12 months only, with no year header or arrows.
   - Picking a month collapses the month list to one labelled row ("Month: March"), and the year list slides down
     beneath it.
   - Picking a year commits `'YYYY-MM'` and closes the panel.
   - Clicking the collapsed row reopens the month step.
2. **Open state:** the panel always opens on the month step, with the value's month marked and focused. The year step
   then focuses the value's year, else this year, else the nearest enabled year.
3. **Disabling:**
   - A month row is disabled when it is disabled in every year the bounds allow.
   - After a month pick, the years where that month is disabled are disabled.
   - "Disabled" keeps ADR-0063's rule: a month is out only when all its days are.
4. **Range:** one sequential flow of four labelled steps, "Start month", "Start year", "End month" and "End year".
   - Each finished pick collapses to a labelled row ("Start: March 2026") that can be clicked to redo it.
   - The start is pending, never emitted, until the end year completes the range and closes the panel.
   - A reversed range swaps, and dismissing the panel discards the start.
   - There is no range band any more: there is no single list to paint it on.
5. **Labels in single mode too:** "Month" and "Year" above the lists.
   - New `texts` keys: `month`, `year`, `startMonth`, `startYear`, `endMonth`, `endYear`. All are overridable,
     with English defaults.

### Defaults I chose without asking

- **Keyboard:** the month and year lists keep the existing list keys (arrows, Home/End, Enter/Space). PageUp/PageDown
  in the month list go away, since there is no displayed year any more.
  - The collapsed rows are buttons in the Tab order inside the dialog's focus trap, so Shift+Tab plus Enter goes
    back a step.
  - After each pick, focus moves to the new list.
- **Motion:** the year list unrolls downward with the same keyframes as today's list entrance. The collapsed row is
  instant. Under reduced motion everything is instant (`prefersReducedMotion`).
- **Year list:** ascending, spanning the bounds, else ±100 years. It opens scrolled to centre its focused year, as
  `focusOption(true)` does today.
- **Fullscreen panel:** the same steps stacked. The step lists fill the remaining height.
- **Accessible names:**
  - Month options are named by the month alone, because no year is chosen yet. Under range they read "March, start
    month".
  - Year options are named by the year.
  - The pending-start announcement names the month and year, through the existing `pendingStart` text.

### Implementation (`packages/csc-ui/src/components/c-date-picker/`)

### `CDatePicker.vue`

1. **Remove the month-mode header:**
   - The year control gets `v-if="!monthMode"`, and the `month` tv variant's `header: 'justify-center'` goes.
   - `pageYear`, the month-mode branches of `canStep`/`stepMonth`, and the PageUp/PageDown branch in
     `onListKeyDown` are deleted.
2. **Step state** replaces `view` in month mode:
   - `monthStep = ref<'end-month' | 'end-year' | 'start-month' | 'start-year'>('start-month')`, single mode using
     only the two `start-*` steps.
   - `draftMonth` (1–12) holds the month picked for the current end.
   - The existing `pendingStart` (a `'YYYY-MM'` string) is reused for a range's finished start.
3. **Template, in the body:** in month mode, instead of the `ul` swap, render `v-if="monthMode"`:
   - collapsed rows for finished steps: a `button`, `part="step-summary"`, label plus value;
   - the step label for the current step: `part="step-label"`, `id` referenced by the listbox's
     `aria-labelledby`;
   - the current step's listbox, which reuses `part="list"`/`part="option"`, the `ui.list`/`ui.option` slots and the
     check icon.

   The year list is wrapped in the existing `<transition :css="false">` hooks, so its entrance reuses `bodyMotion`'s
   `list-in` keyframes. `onBodyEnter` already caps a `ul` by `applyListCap`.
4. **`listOptions` in month mode:**
   - Month step: 12 months, `disabled` when `isMonthDisabledEverywhere(m)`.
   - Year step: the years of `yearSpan`, `disabled` when `isMonthDisabled(isoMonth(y, draftMonth))`.
   - `selected` marks the committed value's month or year, or the pending start's on the end steps.
5. **Picking:**
   - A month pick sets `draftMonth` and advances to the matching `*-year` step.
   - A year pick builds the month.
     - Single mode commits it and closes.
     - Range start: set `pendingStart`, announce through `pendingStart`, and advance to `end-month`.
     - Range end: commit `{ start, end }` (swapped when reversed), clear `pendingStart`, and close.
   - A summary-row click returns to that step and clears the later ones.
6. **Open and close:**
   - `onOpened` in month mode resets to `start-month`, with `listIndex` on the value's month (else this month) and
     `focusOption(true)`.
   - `onClosed` discards `pendingStart` and the draft.
   - The month body's height rule stays (`month: { body: 'h-[276px]' }`), with the step label and summary rows
     inside it, so the list is the flexible part. Re-check the peek cap against the shorter list.
7. **Texts:**
   - Add the six keys to `CDatePickerTexts` and `DEFAULT_TEXTS`.
   - `intlNames` needs nothing new.
   - New parts get tag-only docblocks: `step-label` and `step-summary`.
8. **Remove month-mode band code:** the `band` option variant, `ListOption.band`, the `pointerenter` and
   `pointerleave` hover handlers on the list, and the month branch in `bandSpan`. Date mode's day band is untouched.

### `dates.ts`

- Add `isMonthDisabledEverywhere(m, years, rules)`. It is true when `isDisabledMonth(isoMonth(y, m), rules)` holds
  for every year of the span.
  - It stops at the first enabled year.
  - The span is the bounds' years; unbounded, it is ±100 around today. With no day rules it is instant, because
    `isDisabledMonth` returns early on bounds.
  - A predicate that disables most days costs up to 201 years × 31 days for one month row. That's acceptable but
    worth a note in `usage.md`.
- Node specs: bounds within one year disable the months outside them, and a full-July span disables July only when
  it covers every allowed year.

### Specs (`CDatePicker.spec.ts`, rewrite the `type="month"` block)

- Opens on the month step: no header controls, "Month" label, focus on the value's month.
- A month pick shows the "Month: March" summary and the "Year" list, with focus on the value's year. A year pick
  commits `'2031-03'`, closes and emits once.
- The keyboard runs the whole flow: arrows, then Enter, then arrows, then Enter.
- Clicking the summary row returns to the months.
- Disabling:
  - `min`/`max` within one year disable the months outside them;
  - the year step disables years where the picked month is out.
- Typing, the full-date value and the derived format: keep the existing specs unchanged.
- No `change:month`: keep the existing spec.
- Range:
  - the four labels in order;
  - the start summary row;
  - no emission until the end year;
  - a reversed range swaps;
  - Escape discards the pending start;
  - announced.
- Fullscreen: the steps stack and the list fills the height.
- Baselines: replace `month-panel` and `month-range-band` with `month-step`, `year-step` and `range-end-month` (the
  start summary plus the "End month" list), in light and dark.
  - Pixel-diff the date-mode baselines against HEAD again (pngjs), and restore noise-only files.

### Docs and records

- **ADR-0063, amended in place:**
  - Replace the Panel, Ranges and keyboard bullets with the steps above.
  - Add "Displayed year with arrows (the first build)" to Alternatives, as confusing in use.
  - Drop the band consequence.
- **`CONTEXT.md`:**
  - Remove **Displayed year**.
  - Add **Month step** / **Year step** ("the two labelled lists of month mode: the month first, then the year,
    each collapsing to a summary row once picked").
  - Update Month list, Pending start (month mode) and Range band (day grid only).
- **`usage.md` "Months":** rewrite the panel and range paragraphs. Remove PageUp/PageDown and the year arrows.
- **Docs example** (`app/examples/c-date-picker/month.*`): unchanged. The API is the same.
- **`_plan/date-picker-month-type.md`:** add a "Revision: step flow" section pointing here, so the repo plan stays
  the record.
- **Changeset `.changeset/date-picker-month-type.md`:** still accurate. It isn't released yet, so no new changeset.
- **Generated files:** regenerate the tag map and the API snapshots for the new texts keys and parts.

### Verification

- `pnpm ui test:node` covers the dates specs and the snapshots.
- Browser, one file per run: `CDatePicker.spec.ts`, then the conformance suites filtered to `c-date-picker`.
- `type-check`, the csc-ui build (grep `dist` for the new utilities' rules), the React build, and the docs example
  smoke.
- Look at the new PNGs in light and dark. Manually check the docs dev server at desktop and phone width: the year
  list sliding in, the summary rows, and the range flow.
