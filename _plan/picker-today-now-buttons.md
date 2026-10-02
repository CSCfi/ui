# c-date-picker Today button, c-time-picker Now button

Decided in a grilling session on 2026-10-02 and recorded in ADR-0065. The glossary (`CONTEXT.md`) gained **Today
button** and **Now button**.

**Status (2026-10-02): phases 1–4 implemented, not committed.** Where the build differs from the steps below:

- **A native `<button>`, not `c-button`.** The panels' Tab trap only collects native `button`s and `[tabindex="0"]`
  inside the card, so a nested `c-button` was unreachable. The native button copies the text-button look: bold,
  `text-primary`, `rounded-csc-md`, the panel's hover wash and inset focus ring, and `text-on-surface-disabled` when
  disabled. So the `exportparts` question went away: `part="today"` / `part="now"` sit directly on the button.
- **Now's disabled state** is re-read on open and on press only, as for the date picker's today.
- **Specs read the clock around the press** (accepting the before or after reading) rather than faking `Date`. The
  `vi.setSystemTime` hazard was never tested.
- **The calendar's `pb-3` stayed:** the gap above the row matches MD3's action row, so nothing was trimmed.

## Rules

- **Opt-in:** `show-today` (`c-date-picker`) and `show-now` (`c-time-picker`), booleans, `@defaultable false`.
- **Placement:** an end-aligned text `c-button` in its own row under the panel body. It stays through every view swap
  (grid, month/year list, month/year steps), sits at the bottom edge of the fullscreen panel, and is the last Tab stop.
- **Today = pressing today's cell:**
  - Single: commit today, close, focus returns to the input.
  - `range`, no pending start: today becomes the pending start (announced). The body returns to the day grid on
    today's month, and focus goes to today's cell.
  - `range`, with a pending start: complete the range in order, then close.
- **Month mode:** the label is "This month". It picks the current month as both steps at once: single commits
  `'YYYY-MM'` and closes; under `range` the first press makes the month the pending start and opens the `end-month`
  step, focused; with a pending start it completes the range in order and closes.
- **Now:** commit the current time to the exact minute (seconds dropped, `minute-step` ignored) and close. Under
  `range` it sets the end being edited (`editing`); focus returns to `lastInput`, as on Escape.
- **Disabled, never hidden:** the date button is disabled when `isDisabled(today)` (month mode: when the current month
  is disabled by ADR-0063's rule). The time button is disabled when now is outside `min`/`max`. Both are evaluated
  when the panel opens and again on press. The press re-reads the clock and does nothing if the button would be
  disabled by then.
- **Texts:** `today` ("Today"), `thisMonth` ("This month") and `now` ("Now"), English built-ins with no `Intl`
  fallback.
- A press is a pick: it clears bad input, reformats the text and emits `change`, `update:value` and `input`, but not
  `change:text`.

## Phase 1: c-date-picker

All in `CDatePicker.vue` unless named.

1. **Prop:** `showToday?: boolean` with `@defaultable false`, resolved through `appDefault('showToday', false)` like
   `showWeekNumbers` (~910). Docblock tags only, no prose (ADR-0026).
2. **Texts:** add `today` and `thisMonth` to `CDatePickerTexts` (alphabetical, with JSDoc like the other keys) and to
   `DEFAULT_TEXTS`.
3. **Template:** after `<div :class="ui.calendar()">`, still inside the card, add
   `<div v-if="showTodayResolved" :class="ui.actions()" part="actions">` holding a
   `<c-button text size="small" part="today" :disabled="todayDisabled" @click="pickToday">`. The label is
   `monthMode ? t.thisMonth : t.today`. The row sits outside the `<Transition>` body so view swaps never move it.
   - Check whether a `part` set on a `c-button` inside our shadow root can be targeted from outside. If not, wrap
     the button or forward the part with `exportparts`, following whatever pattern existing nested-component parts
     use.
4. **Styles:** the `actions` slot is `flex justify-end px-3 pb-3`. Under `fullscreen: true` it gets
   `mt-auto w-full max-w-[400px] mx-auto` so it pins to the bottom edge under the `flex-1` calendar. Check that the
   calendar's own `pb-3` doesn't double the gap; trim one of the two.
5. **Logic:**
   - `todayDisabled`: computed from `today.value` (refreshed in `onOpened`) via `isDisabled` in date mode; in month
     mode, the same rule the month step uses for (this year, this month) (`isDisabledMonth` / bounds).
   - `pickToday()`:
     1. Set `today.value = todayIso()` so the ring follows a panel left open across midnight.
     2. If disabled, return.
     3. Date mode, with a range and no pending start: `view.value = 'days'`,
        `setMonth(monthOf(today), false, animate)`, `focusedDate.value = today`, then `pick(today)` and `focusCell()`.
     4. Otherwise: `pick(today)` (it commits and closes).
     5. Month mode: factor the tail of the year-step pick (~1760–1785) into `pickMonthValue(month)` and call it with
        the current `'YYYY-MM'`. Reset `draftMonth`, and for a first range press `enterStep('end-month')` with
        focus.
   - Escape and light dismiss keep discarding the pending start (`onClosed`); nothing new is needed there.
6. **Parts / docs:** add `@csspart actions` and `@csspart today` to the docblock, plus the new texts. Then
   regenerate `api.snapshot.json` and the manifest.

## Phase 2: c-time-picker

1. **Prop:** `showNow?: boolean`, `@defaultable false`, resolved through `appDefault`.
2. **Texts:** add `now` to `CTimePickerTexts` and `DEFAULT_TEXTS`.
3. **Template:** after the `columns` div, add `<div v-if="showNowResolved" :class="ui.actions()" part="actions">`
   holding a `c-button text size="small" part="now"`. Under `range` it sits below the tabpanel, outside it, because
   it isn't the panel of either tab.
4. **Styles:** the `actions` slot is `flex justify-end px-2 pb-2` (the columns use `p-2`); under fullscreen, `mt-auto`
   below the `flex-1 min-h-0` columns. The card is `w-max`, so the row must not widen it: check the 12-hour
   three-column width against a long translated label.
5. **Logic:**
   - `nowDisabled`: `toMinutes(nowTime())` is outside `bounds`. Evaluate it on open, and again on every Tab into the
     button and on press, because the clock moves while the panel is open.
   - `pickNow()`: read `nowTime()`. If out of bounds, return. Otherwise
     `commitValue({ ...ends.value, [rangeOn ? editing : 'start']: now })` and `closePanel(true)`.
   - There's no clamping, because a disabled button can't be pressed. Never route this through `pickPart`, which fills
     in parts and clamps.
6. **Parts / docs:** add `@csspart actions` and `@csspart now`, plus the `now` text. Regenerate the snapshot and the
   manifest.

## Phase 3: specs and baselines

Both specs pin fixtures far from today. These cases read the wall clock instead: read `todayIso()` / `nowTime()`
(imported from `dates.ts` / `times.ts`) before and after the press, and accept either reading, so a midnight or
minute rollover can't flake.

- **Hazard to check first:** whether `vi.setSystemTime` / fake `Date` breaks Vue's event-timestamp guard, given the
  browser setup's monotonic `Date.now()` (`src/test/monotonicClock.ts`). If faking is safe, pin the clock instead; if
  not, use the before/after readings above.
- **Date picker:**
  - The prop is off: no `[part=actions]`.
  - Single: the press commits today, closes, and focus is back on the input; bad input is cleared.
  - Range, first press: no `change` event, today is the pending start, focus is on today's cell, and today's month
    is displayed (`change:month` fired). Second press: an ordered range, and the panel closes.
  - Range, first press from the year list: the body returns to the grid.
  - Disabled: `max` set before today, or today in `disabled-dates`, or `is-date-disabled` rejecting today → the button
    is disabled and a click emits nothing.
  - Month mode: the label is "This month"; single commits `'YYYY-MM'`; range first press opens the end-month step.
  - Texts override the labels; the app default turns the button on.
  - Tab order: the grid comes before the button, and Tab from the button cycles back.
- **Time picker:**
  - Off by default.
  - The press commits the exact minute with `minute-step="15"` (assert it isn't snapped), then closes and focus
    returns to the input.
  - Range: the end switch is on End → only `end` changes.
  - Disabled when `max` is before now. Pin `min`/`max` relative to the clock read in the spec, staying away from
    midnight; skip the case if the run starts within a minute of 00:00.
- **Visual baselines (both modes):**
  - One new canon per picker with the prop on and no bounds, so the button is enabled whatever the date: an anchored
    open panel showing the row.
  - Existing baselines must not change (the prop is off). Per the `-t --update` hazard in memory, delete only the new
    PNGs and run one spec file at a time.
- **Conformance:** the parts and texts enrol automatically. Run the conformance suites to confirm.

## Phase 4: docs, wrapper, changeset

- **`usage.md` (both):** a short "Today" / "Now" section next to the existing sections. Cover what the press commits,
  range behaviour, "This month", the exact minute, and disabled-not-hidden. Add the per-month `disabled-dates` note:
  keep today's dates in the list, or use `is-date-disabled`. The description paragraph is unchanged.
- **Examples:** add `show-today` to the date picker's `basic` canon or a new `today` example, with all flavours
  (`.vue`, `.react.tsx`, `.angular.ts`, `.typescript.html/.ts`). Do the same for the time picker. The parity script
  guards v-model and explicit imports; no `.prop`.
- **React:** `pnpm --filter @cscfi/csc-ui-react build` regenerates the wrappers. Don't hand-edit them.
- **Changeset:** one new `minor` file for both packages: "Add `show-today` to c-date-picker and `show-now` to
  c-time-picker: an opt-in button that picks today (this month under `type="month"`) or the current time."
- **Before committing:** run `pnpm ui lint`, both spec files (one per run, because of devcontainer memory), the docs
  example smoke, the CI `type-check` step (spec types), and `pnpm build` (check the Tailwind scan picked up the new
  utilities in dist).

## Out of scope

- A keyboard shortcut for today (e.g. `T` in the grid).
- A consumer-supplied "now" (server time, a fixed timezone). Both buttons read the browser's local clock, like the
  grid's today ring.
- A Clear button in the row; `clearable` stays in the field.
