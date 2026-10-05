# Fix(c-date-picker, c-time-picker): ring the panel's focus under keyboard modality

## Context

Reported in Firefox: click into the date picker's field, then press Alt+↓. The
panel opens with focus on a day, but no focus ring shows. Arrow keys still move
the roving day (Enter picks the moved date), yet no ring appears. Tab inside the
panel brings rings back.

Diagnosis (reproduced in headless Chromium 148 over CDP, scratchpad `dp/run.mjs`):

1. **An Alt chord gives no keyboard modality.** Browsers decide whether to show
   `:focus-visible` with a heuristic. Chromium (like the WICG polyfill) ignores
   keydowns that carry Alt, Ctrl or Meta. Firefox and Safari carry the last focus
   method, here the mouse, through every script `focus()` until a Tab. The pickers
   move focus with a plain `.focus()`, so after a mouse-focused field the day and
   the column rows never ring. In Chromium the first plain arrow key brings the
   ring back; in Firefox it never does.
   - The last focus-ring fix (56720439) hid this in its specs by pressing
     `{ArrowLeft}` before Alt+↓ (`CDatePicker.spec.ts:853`,
     `CTimePicker.spec.ts:900`). c-time-picker has the same bug.
   - `focus({ focusVisible: true })` forces the ring. Measured in Chromium 148;
     Firefox has supported it since 104 and Safari since 18.4. TypeScript's DOM lib
     already types it.
2. **A selected day's ring is invisible even when it matches.** The day ring is
   `outline-primary` at offset 0 around a `bg-primary` fill, so it reads as a
   slightly larger disc. This hits the value the panel usually opens on.

## Decisions (grilled 2026-10-05)

- **Ring policy: keyboard-driven only.** A panel focus move rings when the latest
  press the picker saw was a key, Alt chords included. Under pointer modality the
  browser's heuristic decides; the code never forces `focusVisible: false`, so a
  mouse open stays unringed.
- **Scope: both pickers, one shared helper, one Fix commit, one changeset.**
- **Selected day: an on-primary ring inside the fill.** This is the time picker's
  selected-end-tab precedent. Unselected days keep the flush primary ring.
- **Glossary: add "Keyboard modality" to CONTEXT.md.** No ADR: the change is cheap
  to reverse.

## Implementation

0. Copy this plan to `_plan/picker-keyboard-focus-ring.md` (repo convention).

1. **Specs first, and confirm they fail** (each spec file in its own run).
   - `c-date-picker/CDatePicker.spec.ts`, `describe('focus ring')`:
     - `openFromKeyboard` becomes `userEvent.click(inputs(m)[0])` followed by
       `{Alt>}{ArrowDown}{/Alt}`, with no `{ArrowLeft}`. Rewrite its comment
       around keyboard modality. The three existing specs then fail before the fix.
     - New: "rings the opening day after a mouse-focused field and Alt+↓". The
       opening cell `matches(':focus-visible')` and its day paints `solid 2px`.
     - New: "rings a selected day in on-primary, inside the fill". On the value
       cell, `outlineOffset` is `-4px` and `outlineColor` equals an on-primary
       probe. Read it after `settled()`, because `transition-colors` animates
       outline-color.
     - New: "forces the ring on keyboard moves only". Open with the calendar button
       (mouse): the cell is not `:focus-visible`. Then spy on
       `HTMLElement.prototype.focus`, press ArrowRight, and check the last call
       carries `focusVisible: true`. This guards the Firefox/Safari path, which
       Chromium CI can't show.
   - `c-time-picker/CTimePicker.spec.ts`: the same `openFromKeyboard` change at
     ~l.900, plus "rings the hour column after a mouse-focused field and Alt+↓".

2. **New shared helper** `packages/csc-ui/src/shared/useKeyboardModality.ts`.
   - `useKeyboardModality(host: HTMLElement | null | undefined)` adds
     capture-phase `keydown` and `pointerdown` listeners to the host in
     `onMounted` and removes them in `onBeforeUnmount`.
   - Any keydown sets keyboard modality; any pointerdown clears it. Keydown is
     composed, so presses in the input, cells and buttons all reach the host.
   - It returns `focusOptions(options?: FocusOptions): FocusOptions`, which adds
     `focusVisible: true` only under keyboard modality.
   - The docblock links CONTEXT.md "Keyboard modality" and explains the Alt-chord
     and Firefox heuristics. It follows the style of `lightDismiss.ts`.

3. **c-date-picker** (`CDatePicker.vue`, using `host` from `useHost()` at l.951):
   route the focus calls through `focusOptions` in `focusCell` (l.1516),
   `focusOption` (l.1960: `focusOptions({ preventScroll: center })`) and the Tab
   trap (l.2175).

4. **c-time-picker** (`CTimePicker.vue`, using `host` at l.543): route `afterPick`
   (l.821), the end-switch focus (l.954), the Tab trap (l.1036) and `onOpened`
   (l.1164) through `focusOptions`.

5. **Selected-day ring.** In `CDatePicker.vue`'s `dayCell` `selected.true.day`
   (~l.912), append `group-focus-visible:-outline-offset-4 group-focus-visible:outline-on-primary`.
   This covers the value, range ends and a pending start. The base slot carries the
   same modifier, so check that tailwind-merge keeps the variant's classes (the
   spec's computed-style read catches it if not).

6. **CONTEXT.md.** Add an entry next to "Focus ring (selection controls)":
   > **Keyboard modality**:
   > Whether the latest press a component saw was a key (any key, Alt, Ctrl and
   > Meta chords included) rather than a pointer press. A panel that moves focus by
   > script (the **day grid**, a **time column**) rings the new focus under
   > keyboard modality and otherwise leaves the browser's `:focus-visible`
   > heuristic alone.
   > _Avoid_: focus-visible (the CSS pseudo-class, whose browser heuristics ignore
   > chords and carry a mouse focus through script focus), keyboard mode

7. **Changeset** `.changeset/picker-keyboard-modality-ring.md`, a patch for
   `@cscfi/csc-ui` and `@cscfi/csc-ui-react` (pre mode is on; a new file). Draft:
   "c-date-picker and c-time-picker ring the panel's focused day or row after
   Alt+↓ and the arrow keys, also when the field was clicked first and in Firefox.
   A selected day rings in its own ink, inside the fill."

8. **Memory.** Add a reference memory: Chromium ignores Alt/Ctrl/Meta chords for
   `:focus-visible`, Firefox carries a mouse focus through script focus, and the
   fix is `focusVisible: true` under keyboard modality. Add to the Firefox-ESR
   memory that headless Firefox never holds window focus (`hasFocus()` stays false
   even with `focusmanager.testmode`), so `:focus`/`:focus-visible` can't be
   measured there.

## Verification

- From `packages/csc-ui`, run one file per invocation (devcontainer OOM):
  `npx vitest run src/components/c-date-picker/CDatePicker.spec.ts --project browser`,
  then the same for `c-time-picker/CTimePicker.spec.ts`. Run the new or changed
  specs before steps 2–5 and confirm they fail, then after and confirm they pass.
- Visual baselines should be unchanged: they open with a mouse click, and keyboard
  list steps already rang. If a picker baseline diffs, review the PNG and don't
  raise the tolerance.
- `pnpm ui lint` (tokens, focus-ring guard) and
  `pnpm --filter @cscfi/csc-ui run type-check` (the CI step `pnpm build` skips).
- `pnpm ui build`, then rerun the scratchpad CDP repro (`dp/run.mjs`) against the
  new dist: mouse-focused field, then Alt+↓, gives a cell with `:focus-visible`
  true and an on-primary ring inside the disc.
- Ask the user to confirm in Firefox (headless Firefox can't measure focus): click
  the field, press Alt+↓, then the arrows, and a ring should follow every step.

## Out of scope (possible follow-ups)

- A focused unselected day's 2px primary ring looks a lot like today's 1px
  primary outline. Not reported, so left as is.
