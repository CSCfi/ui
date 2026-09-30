# c-time-picker: implementation plan

## Context
`_todo/timepicker.md` asks for a time picker built like `c-date-picker`: an input plus a popover, 12h and 24h
support, and side-by-side scrollable lists (hour and minute, plus AM/PM in 12h). It must be accessible, keyboard
operable, and typeable without the panel. The grilling session on 2026-09-30 settled the design. It is recorded in:
- **ADR-0061** (value and typing)
- **ADR-0062** (field and panel)
- the **Time picker** section of `CONTEXT.md` (Time picker, Time column, Period, Minute step, End switch, Overnight
  range; **Bad input** widened)

Both ADRs are *Proposed*. Flip them to *Accepted* when the component ships.

## Settled design (summary; the ADRs are authoritative)
- **Value**: an ISO `HH:mm` string on a 24h clock, or `null`. Under `range` it's `{ start, end }`, either end may be
  `null`, and both-null collapses to `null`. No seconds.
- **`format`**: tokens `H HH h hh mm a` plus literals. `@defaultable 'HH.mm'`. It displays, parses and masks.
- **Typing**: masked from `format`, and pastes are left unmasked. Parsing on Enter or blur is lenient: `9` → 09:00,
  `930` → 09:30, `. : space` separate, a 12h field accepts a 24h time and `a`/`p`, and a missing period reads as AM.
- **Constraints**: `min` / `max` only. `min > max` is invalid (warn and ignore). Typed text outside them is **bad
  input**. `minute-step` (default 1) only thins the minute column.
- **Range**: an **overnight range** (end < start) is valid and never swapped.
- **Field and panel**: the ADR-0058 model, with a clock button and Alt+↓. The panel is a `role="dialog"` that takes
  real focus and a Tab cycle, and becomes the fullscreen panel on a narrow viewport.
- **Columns**: each column is a `role="listbox"`, one tab stop, `aria-label` only. Up/Down, Home/End and
  PageUp/PageDown move and commit (selection follows focus). Enter closes.
- **Live commit**: every pick commits immediately. Missing parts fill in: the hour from the hour column's focused
  row, minute `00`, the current period. The panel closes on Escape, Enter, light dismiss or the close button.
- **Empty open**: focus lands on the current hour and the minute column scrolls to the current minute, rounded to the
  step. Landing never commits.
- **Clamping**: a pick never leaves `min`/`max`. The minute clamps to the bound, and rows outside the bounds are
  `aria-disabled`.
- **Column scrolling**: finite lists. The selected row scrolls to the top, the column ends on a peek row, and the
  scrollbar is hidden. The fullscreen panel has no peek.
- **Range panel**: an end switch (Start | End) above one column set. It opens on the last-focused end.
- The typed-field shell is extracted from `c-date-picker` into `src/shared` before the time picker is built.

## Phase 1: extract the typed-field shell (refactor, no behaviour change)
The field half of `CDatePicker.vue` (roughly lines 1–104 of the template and 1038–1276 of the script) is generic
over a codec. Extract it as follows:

- **`src/shared/useTypedField.ts`**: a composable that owns:
  - `ends` / `normalize` / `toValue` / `sameEnds`;
  - `startText` / `endText` / `committedText`;
  - `badStart` / `badEnd` / `badInput` plus `setState('bad-input')`;
  - `syncTexts`, the programmatic-`value` watcher (never emits) and the pattern-change reformat;
  - `setEnds` → `emitModelChange`;
  - `commitText` → `change:text`, `onTextInput` (`applyMask`, `skipPaste`) and `onClear`.

  Its inputs:
  - `rangeOn`
  - `pattern`
  - a codec `{ isValue, parse, format, mask, isUsable }`
  - `reversed: 'swap' | 'keep'` (the date picker swaps; the time picker keeps overnight ranges)
  - `host` and `emit`
- **`src/shared/TypedField.vue`**: a child SFC for the anatomy. It holds the `c-input` wrapper with its forwarded
  props and the `data-hide-details` quirk, the start input, the separator and the end input (parts `input` and
  `separator`), the `startWidth` / `field-sizing` fallback, and the clear button. A `trigger` slot takes the
  component's own icon button.
  - It lives in the host's shadow root, so the parts stay addressable, as with `PanelHeadingRow.vue`.
  - Keep `inputmode="numeric"` for the date picker. The time picker in 12h mode needs `inputmode="text"` because
    `a`/`p` must be typeable, so make it a prop.
- **Private type names**: prefix them `TypedField…` (the tag-map collision hazard).
- **Rebuild `CDatePicker.vue` on both**:
  - `CDatePicker.spec.ts`, its baselines and `api.snapshot.json` must pass **unchanged**.
  - The manifest diff (`pnpm ui docs:manifest`) must be empty apart from source locations.
- **No changeset**: this is an internal refactor.
- Commit: `Refactor(c-date-picker): Extract the typed-field shell into src/shared` (the repo already uses `Refactor(`).

## Phase 2: pure time helpers
**`src/components/c-time-picker/times.ts`**:
- **ISO helpers**: `isTime`, `toMinutes('HH:mm')` / `fromMinutes`, `nowTime()`.
- **Patterns**: `tokenize` and `isValidPattern` for `H HH h hh mm a`. A pattern needs exactly one hour token and one
  `mm`. `h`/`hh` require `a`, and `a` requires `h`/`hh`.
- **Display**: `formatTime(iso, pattern, periods)`, where `periods = { am, pm }` are the resolved texts.
- **Parsing**: `parseTime(text, pattern, periods)`:
  - accepts a bare hour, a 3–4 digit run (`930`, `0930`), a separator from `. : space`, and a 24h hour in a 12h
    pattern;
  - reads the period from the first letter(s) of the resolved AM/PM texts, case-insensitive; if both texts start with
    the same letter, the first letter that differs decides;
  - with no period, a 12h hour reads as AM;
  - `9.3` → 09:03.
- **Mask**: `compileTimeMask(pattern, periods)`:
  - an hour closes early on a digit no two-digit hour can start with (> `2` in 24h, > `1` in 12h);
  - a minute closes on a first digit > `5`;
  - separators accept `. : space` as aliases;
  - the `a` slot is described under the mask engine change below.
- **Bounds**: `bounds(min, max)` returns `null` for invalid or reversed bounds. `inRange`, `clampToBounds(hour,
  minute)`, `hourDisabled(h)`, `minuteDisabled(h, m)`.
- **Columns**:
  - `hourRows(cycle)` gives `0…23`, or `12, 1…11` for 12h;
  - `minuteRows(step, current)` gives the multiples of the step plus the current off-step minute, sorted in;
  - `roundToStep`.

**Mask engine change** in `src/shared/inputMask.ts`. The period is a word, not characters. Add an optional
`expand?: (typed: string) => string | null` to token slots. When it returns text, the slot fills with that text (for
example `p` → `PM`) and closes. This keeps one engine, as ADR-0059 requires. Extend `inputMask.node.spec.ts` for it.
Also check that Backspace over an expanded slot clears the whole word.

**`times.node.spec.ts`** covers:
- format and parse tables for `HH.mm`, `H:mm`, `h:mm a`, `hh.mm a`;
- `12:xx AM` = `00:xx`, `12:xx PM` = `12:xx`;
- a 24h time in a 12h pattern;
- Finnish `ap.`/`ip.` periods;
- rejection of invalid patterns;
- `min > max` → `null`;
- clamping at both bounds;
- off-step minute rows;
- mask sequences (`930` → `9.30`, `2` stays open in 24h, `7` closes a minute, `p` → `PM`).

## Phase 3: CTimePicker.vue
**`src/components/c-time-picker/CTimePicker.vue`** is modelled on `CDatePicker.vue` and uses:
- `TypedField` / `useTypedField`, with `reversed: 'keep'`;
- `useAnchoredPanel` with `fullscreen: useNarrowViewport()`;
- `PanelHeadingRow`, `useAppDefault`, `useHostEmit<CTimePickerEvents>`, `useHostStates`, `applyPeekCap`.

**Props**:
- `clearable`, `disabled`, `error-message`, `hide-details`*, `hint`, `host-id`, `label`, `label-on-top`*, `name`,
  `placeholder`, `required`, `shadow`*, `size`*, `valid`, `value`, `range`, `texts`*;
- `format`* (`'HH.mm'`), `min`, `max`, `minute-step` (1, positive integers only, dividing 60 or not).

`*` marks an `@defaultable` prop.

**Texts** (`CTimePickerTexts`) resolve as own → app default → `Intl` → English. `Intl` only supplies `am`/`pm`
(`formatToParts` `dayPeriod` for the page's `lang`). The keys are:
- `am`, `pm`
- `hours`, `minutes`, `period` (column names)
- `openClock`, `clearSelection`, `closePanel`
- `start`, `end`
- `chooseTime` (dialog name when there is no label)

**Events**: `change`, `update:value`, `input` via `emitModelChange` (on interaction only), plus `change:text`. Expose
`badInput`. `@cssstate bad-input`.

**Panel anatomy**:
- `panel`, `card`
- (fullscreen) `heading-row` / `heading` / `close`
- (range) the end switch: `c-tab-buttons` rendered in the shadow root with part `end-switch`. Check that its own
  arrow-key model and focus work inside the trapped dialog. If not, fall back to a two-button `role="radiogroup"`.
- `columns`, then `column` × 2–3 (`role="listbox"`), then `option` rows (`role="option"`, `aria-selected`,
  `aria-disabled`).

**Behaviour**:
- **Opening**: open from the clock button (`mdiClockOutline`) or Alt+↓; the input commits first, as in the date
  picker. Focus lands on the hour column's selected row. For an empty value it lands on `nowTime()`'s hour, with the
  minute column scrolled to the rounded current minute. Nothing commits on landing.
- **Scrolling**: on open each column scrolls its selected (or landing) row to the top. `applyPeekCap` sizes the
  columns and re-runs in rAF after the rows change. `scrollbar-width: none` via the existing utility. The fullscreen
  panel has no peek, and the columns fill the height.
- **Keys** in a column:
  - Up/Down move ±1 row and skip disabled rows.
  - Home/End go to the first or last enabled row.
  - PageUp/PageDown move ±5 rows.
  - Each move commits.
  - Space commits the focused row, which matters after a landing that didn't commit.
  - Enter commits the focused row and closes, returning focus to the last input.
  - Tab cycles: end switch → columns → (fullscreen) close.
  - Escape closes. Committed picks stay, since there is nothing to revert.
- **Clicks**: a click commits the row and keeps the panel open.
- **Commit rules**:
  - An hour pick keeps the minute (or `00`), a minute pick keeps the hour (or the hour column's focused row), and a
    period pick flips the hour ±12.
  - Every result goes through `clampToBounds`.
  - In range mode the end switch picks which end is committed.
- **Disabled rows**: hour rows are disabled when the whole hour is outside the bounds. Minute rows are disabled for
  the selected (or focused) hour. Period rows are disabled when the whole half-day is out.
- **Reopen**: reopening in range mode starts on the last-focused end.
- **Resizing**: crossing the narrow-viewport threshold while open closes the panel (the `useAnchoredPanel` rule).

**Registration and API**:
- Register `['c-time-picker', CTimePicker]` in `src/index.ts` after `c-date-picker`, and after `c-tab-buttons` if it
  is used. Export `CTimePickerProps`, `CTimePickerValue`, `CTimePickerRange`, `CTimePickerTexts` from the entry.
- `pnpm ui build` regenerates the tag map, the manifest and `api.snapshot.json`; commit them.

## Phase 4: tests
- **`CTimePicker.spec.ts`**, run as one file per run (devcontainer OOM):
  - **Typing and bad input**:
    - typing masks and commits on Enter or blur;
    - lenient commits and reformatting to `format`;
    - bad input → `null` + `:state(bad-input)` + `change:text`;
    - out of bounds is bad input;
    - an off-step minute commits;
    - no emission on a programmatic `value`.
  - **Opening and focus**:
    - Alt+↓ and the button open; focus or click in the text never opens;
    - landing on the selected row;
    - landing on the current time with nothing emitted, using a pinned clock (`vi.setSystemTime` or the date
      picker spec's approach; mind `monotonicClock.ts`).
  - **Keys and commits**:
    - the full column key map with live `change` per move;
    - Enter closes and returns focus; Escape closes; the Tab cycle;
    - `minute-step` rows plus an off-step extra row;
    - the clamp on an hour pick at `min` and at `max`;
    - a period pick flips the hour;
    - 12h rows `12, 1…11`.
  - **Range**: end switch commits each end, overnight kept, half range from typing.
  - **Fullscreen** layout on a narrow viewport.
  - **Invalid bounds**: `min > max` warns once; consume the warning with `consoleSpy.expect`.
- **Conformance**: add `c-time-picker` recipes to `src/test/conformance/kinds.ts` (value-control and anchored-overlay
  kinds, mirroring the `c-date-picker` entries at lines 148, 215 and 394) and to `root-part.ts`. Fix the component,
  never opt out.
- **Visual baselines** (`pnpm ui test:update` in the devcontainer, light and dark):
  - the closed field;
  - the open panel in 24h;
  - the open panel in 12h with a disabled-rows case;
  - the range with the end switch;
  - the fullscreen panel.

  Review the PNGs.
- **Phase 1 guard**: all `CDatePicker.spec.ts` cases and baselines pass unchanged. Run them before and after the
  extraction.

## Phase 5: docs and release
- **`usage.md`**. The first paragraph is the description, e.g. "A time field that takes a typed time, or opens
  hour and minute columns for picking one, or a start and end time under `range`." Sections:
  - Value (`HH:mm` always, and that the display differs under `HH.mm`)
  - Typing and bad input
  - 12-hour format
  - Minute step
  - Min and max
  - Range and overnight ranges (how to require `start <= end`)
  - Texts
  - Parts

  Cross-link `c-date-picker`, and add a reciprocal line to c-date-picker's `usage.md`.
- **Docs examples** in `packages/csc-ui-documentation/app/examples/c-time-picker/`: `basic`, `twelve-hour`,
  `minute-step`, `min-max`, `range`, `texts` (Finnish). Each needs all 5 flavor variants (the `c-date-picker/` file
  set). Use v-model and explicit imports, and never `.prop`.
- **Changeset** `.changeset/time-picker.md`: `@cscfi/csc-ui` minor, "Add c-time-picker: a typeable time field with
  hour and minute columns, 12- and 24-hour formats and time ranges."
- Leave `packages/csc-ui-react` alone; it's regenerated.
- Flip ADR-0061 and ADR-0062 to *Accepted*.
- Commit: `Feat(c-time-picker): Add a time picker with hour and minute columns`, once you say so.

## Verification
- `pnpm ui test -- times` (node) and `pnpm ui test -- CTimePicker` / `CDatePicker` / `inputMask`, one file per
  run. Then the conformance files, one at a time.
- CI type-check (spec types included), `pnpm ui lint` (tokens, a11y, ramp), `pnpm ui build` (strict manifest +
  snapshot), `pnpm --filter csc-ui-react build`, and the docs example smoke (`pnpm --filter csc-ui-documentation
  test`).
- After the first build, grep dist for the new SFC's utilities and rebuild if any are missing (the new-SFC Tailwind
  scan miss).
- **Manual checks**:
  - Firefox 140 ESR anchored placement (the ADR-0056 fallback);
  - a phone check of the fullscreen columns with the keyboard up;
  - a screen-reader pass (VoiceOver/NVDA) on column names and selection-follows-focus announcements.

## Risks and open points
- **`c-tab-buttons` inside a focus-trapped shadow panel** is untested. The fallback is a local radiogroup (see
  Phase 3).
- **Selection-follows-focus with live commit** emits one `change` per keypress. That's intended (ADR-0062), but a
  consumer doing network work on `change` should debounce it. Say so in `usage.md`.
- **The mask `expand` hook** is the only engine change. If it complicates caret handling, use a custom `Conformer`
  (`applyConform`) in `times.ts` for the period only.
- **Phase 1 is a real refactor** of a 2000-line component. Keep it a separate commit, so it can be reviewed and
  reverted on its own.
