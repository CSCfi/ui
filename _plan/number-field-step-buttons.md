# c-number-field: numeric keyboard + step buttons

## Context
`c-number-field` opens a text keyboard on a phone. That is deliberate under
ADR-0060: `inputmode` is set only at `min >= 0`, because iOS numeric pads have
no minus key (`CNumberField.vue:316`). The user also wants up/down controls
that change the value by a `step`. There is no `step` prop today, and
`usage.md` currently promises "never shows spin buttons, and does not change
the number on a scroll or an arrow key". This change reverses both points, so it
needs a new ADR.

## Decisions (grilled 2026-10-02)
1. **Keyboard**: always request the numeric pad: `decimal` when
   `decimals > 0`, else `numeric`, negatives allowed or not. A typed `-` is
   still accepted where the keyboard has one (Android, desktop). On iOS, a
   negative is reached by stepping down, or by pasting.
2. **Step buttons are always shown**. A new `step` prop (`@defaultable 1`, can
   be set app-wide via `applyDefaults`) sets only the amount.
3. **Layout**: stacked ˄ over ˅ at the end of the field, after the consumer
   `post` slot, at the default size (26px targets). At `size="small"` they sit
   side by side (˅ ˄), so each target is 36px tall (WCAG 2.5.8).
4. **Range**: stepping never leaves `[min, max]`. A step that would pass a
   bound lands on it, and that button is disabled at the bound. From a typed
   out-of-range value, a step goes to the nearest bound. Typing still never
   clamps (ADR-0060 unchanged).
5. **Snapping**: a step moves to the next or previous point of the grid
   `base + k·step` (base = `min`, or `0`). An off-grid typed value stays
   valid and is never bad input.
6. **Empty field**: counts from 0 (˄ → `step`, ˅ → `−step`), then clamps
   into range.
7. **step and decimals are independent**: stepped results are rounded to
   `decimals` digits, which removes float noise. The docs warn against a step
   finer than `decimals`.
8. **Inputs that step**: ArrowUp/ArrowDown step once, and PageUp/PageDown step
   10× (preventDefault on all four). Holding a button repeats after about 400ms,
   then every ~75ms, and stops at a bound. There is **no wheel stepping**.
   Home/End keep their caret behaviour.
9. **A11y (APG editable spinbutton)**: the input gets `role="spinbutton"`
   with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`, and
   `aria-valuetext` set to the grouped text. The buttons are `tabindex="-1"`,
   labelled by a new `texts` prop (`{ increase, decrease }`, English defaults,
   resolved own → app default → defaults, as in c-date-picker's `t`).
10. **Focus**: a button `pointerdown` is prevented, so tapping a chevron never
    focuses the input or opens the keyboard. A focused input keeps its focus.
    A `click` without a preceding pointerdown (screen-reader activation) also
    steps once.
11. Each step emits like a keystroke, through `emitModelChange`, so a held
    button emits on every tick. `disabled` or `readonly` disables both buttons
    and the arrow keys.
12. **Terms**: **Step** (the spacing of the grid stepping lands on, the same
    sense as Minute step) and **Step buttons** (the ˄/˅ pair). _Avoid_:
    spinner (the loading indicator), stepper, spin buttons, increment buttons.

## Implementation
First step: copy this plan to `_plan/number-field-step-buttons.md` (repo
convention). The CONTEXT.md terms and the ADR below were resolved during
grilling but are written at execution, because plan mode only allows the plan
file.

**`packages/csc-ui/src/components/c-number-field/numbers.ts`**: a pure
`stepNumber(current: number | null, direction: 1 | -1, opts: { step, min, max,
decimals, multiplier })`, implementing decisions 4–7. Guard against
`step <= 0` or a non-finite step by falling back to 1. Compute the grid index
in scaled integers (or with an epsilon) so `0.1`-type steps snap exactly. Add
cases to `numbers.node.spec.ts`: snapping, bounds, empty, out-of-range start,
float noise, the ×10 multiplier.

**`CNumberField.vue`**:
- Props: `step` (`@defaultable 1`) and `texts?: CNumberFieldTexts`
  (an exported type, component-owned per ADR-0015). Resolve them with
  `appDefault`.
- `inputmode` computed: drop the `allowNegative` branch.
- Template: render the `post` wrapper always. Put the consumer `post` slot
  first, then a step-button group, `tv` slots with a `size` variant
  (stacked vs row). Use inline `mdiChevronUp`/`mdiChevronDown` paths, as the
  date picker uses chevrons, and semantic tokens only.
- The `<input>` gets the spinbutton ARIA, plus `@keydown` for the arrow and
  page keys.
- A `stepBy(direction, multiplier)` helper: it calls `stepNumber`, sets
  `current` and `text` (`formatNumber`), and calls `emitModelChange` when the
  number changed. When focused, it moves the caret to the end.
- Hold-repeat timers start on pointerdown and are cleared on
  pointerup/cancel/leave, at a bound, and in `onBeforeUnmount`.
- Computed `atMin`/`atMax` disable the buttons.
- Possible new `@csspart`s, `step-up` and `step-down`. Confirm with the user
  during implementation; this is the curated part set (ADR-0006).

**Docs and records**:
- `CONTEXT.md`: add **Step** and **Step buttons** next to **Number field**
  (~line 491). Amend the Number field entry to mention stepping.
- New `docs/adr/0064-c-number-field-steps-within-range-and-always-asks-for-a-numeric-keyboard.md`,
  which supersedes ADR-0060's keyboard consequence and records decisions 1–5
  and 8. Note it in 0060's Status ("Amended by ADR-0064").
- `usage.md`: rewrite the "never shows spin buttons" paragraph and the
  keyboard paragraph in Range. Add a **Step** section with an example
  (`step="5" min="0" max="100"`).
- Docs example: a new `app/examples/c-number-field/step.*` canon in all
  flavors (vue, react, angular, typescript), copying `decimals.*`.
- `api.snapshot.json` regenerates. The React wrapper regenerates on build.
- Changeset (minor, user-facing): "c-number-field shows step buttons, steps
  with the arrow keys, and opens the numeric keyboard on phones".

## Verification
- `CNumberField.spec.ts` behaviour specs:
  - `inputmode` with and without `min`
  - a ˄/˅ click emits the snapped value; a bound disables the button
  - out-of-range typed value → step to the bound
  - empty field → ±step
  - ArrowUp/Down and PageUp/Down
  - a button pointerdown does not focus the input
  - hold-repeat with fake timers stops at the bound
  - disabled/readonly do nothing
  - `role`/`aria-value*`
  - `texts` override of the aria-labels
- Run one spec file at a time (devcontainer OOM): `pnpm ui test:node`, then the
  browser project filtered to `c-number-field`.
- Visual baselines: every existing number-field PNG changes (the buttons are
  new). Delete them and rewrite in the devcontainer, then add a `small`-size
  baseline. Review the diffs. Other files' baselines must not change.
- `pnpm ui lint`, `pnpm build`, the docs example smoke, and the CI
  `type-check` step before committing.
