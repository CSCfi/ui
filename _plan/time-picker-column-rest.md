# c-time-picker: selected rows rest at the top or middle

Decided in a grilling session on 2026-09-30 and recorded in ADR-0062 (the columns bullet and two new rejected
alternatives, edited in place).

## Context

Today only opening places the rows: `scrollColumns()` (`CTimePicker.vue` ~877) puts each column's selected row at
the top. A pick after that only calls `.focus()`, and the browser scrolls the row just into view, so where the row
ends up depends on how the user reached it. The last rows can never reach the top either, because the list ends
first. The goal: in a column that overflows, the selected row always settles in one place, which we call its
*resting place*.

## Rules

- **Resting place:** the top in the anchored panel, the middle in the fullscreen panel.
- **When it moves:** on open, and after every pick by click, arrow keys, Home/End or PageUp/PageDown.
- **How it moves:** instantly on open. A pick scrolls smoothly, or instantly when `prefersReducedMotion()` is true.
- **Which columns move:** every column whose selected row changed, including a minute filled in or clamped by
  `min`/`max`. A column whose selection didn't change keeps the scroll position the user left it at.
- **The room:** list padding measured from the column's height. It goes at the end in the anchored panel, and at
  both ends in the fullscreen panel. There are no blank rows: the listbox holds only its options.
- **Columns that fit:** a column whose rows fit its height (the period, a coarse `minute-step`) gets no padding
  and never scrolls.
- **No wheel:** the middle is only where the selected row sits. Scrolling a column never commits a value.
- **Scope:** c-time-picker only.

## Phase 1: measuring and resting (done)

All of this is in `CTimePicker.vue`.

1. **`fitColumn(list)`:** replaces the measuring half of `scrollColumns`.
   - Clear the inline padding first, so the measurement never counts it.
   - Anchored layout: apply `applyPeekCap` (`src/shared/peekCap.ts`) as now.
   - Fullscreen layout: clear `max-height` as now.
   - Then decide whether the column overflows: `scrollHeight > clientHeight`.
   - If it fits, stop. If it overflows, set the room from the measured client height `H`, row height `r` and
     stylesheet padding `p` (`p-1`):
     - Anchored: `padding-block-end = H − r − p`, so the last row can reach the top.
     - Fullscreen: `padding-block-start` and `padding-block-end` both `(H − r) / 2`, so the first and last rows
       can reach the middle.
   - Set these as inline styles on the `ul`. Consumers style the column through `::part(column)` padding, which
     the measurement reads, so there's no new part or token.
   - Order matters: the peek cap runs on the unpadded list, because a padded `scrollHeight` would make a fitting
     column look like it overflows.
2. **`restColumn(kind, behavior)`:** scrolls the selected row (`rowEl(kind)`) to its resting place.
   - Anchored: `row.offsetTop − paddingTop`, which is today's formula.
   - Fullscreen: `row.offsetTop + r/2 − H/2`.
   - Uses `list.scrollTo({ top, behavior })`, and does nothing for a column that fits.
3. **`scrollColumns()`** becomes: `fitColumn` for every column, then `restColumn(kind, 'instant')`. It still runs
   from `onOpened` and `switchEnd`.
4. **Re-fit on resize:** while the panel is open, a `ResizeObserver` on the card re-runs `fitColumn` and
   `restColumn('instant')`. That covers a layout switch, an orientation change and the visual viewport resizing the
   fullscreen panel. Disconnect it on close.

## Phase 2: resting after a pick (done)

1. **Snapshot before the pick:** before a pick commits, record each column's selected key (`columns.value`, from
   `row.selected`).
   - Do it in one helper, `afterPick(kind)`, which replaces `focusRow`.
   - `onRowClick` and `onColumnKeyDown` call `afterPick` after `pickPart`.
   - The Enter branch closes the panel, so it skips this.
2. **After the re-render:** do this in `nextTick`, then `requestAnimationFrame`. A `flush:'post'` pass can measure
   stale DOM here (memory: post-flush watch).
   - Focus the new tab stop with `focus({ preventScroll: true })`, so the browser's own scroll can't fight the
     smooth one.
   - Every column whose selected key differs from the snapshot calls
     `restColumn(kind, prefersReducedMotion() ? 'instant' : 'smooth')`.
   - Use `prefersReducedMotion` from `src/shared/reducedMotion.ts`.
3. **The period column:** a period flip changes the hour values but not the row positions. The hour column's
   selected key changes (`h9` → `h21`), so it rests again. That should be a no-op, because the row index is the
   same. Check that it's not a visible jump.
4. **Programmatic value changes while open:** leave them. Only picks move a column, and the next open re-rests.

## Phase 3: specs, docs, baselines (done)

Specs in `CTimePicker.spec.ts`:

- **Rename the open test:** "opens each column with its selected row at the top, ending on a peek" becomes
  "…at its resting place, ending on a peek". Add `value: '14:55'` with `minuteStep: 5` to it: `m55` sits at the
  top (4px inset), which fails on HEAD.
- **Pick rests:** click `m45` in a column showing `m30` at the top. After the smooth scroll settles, `m45` is at
  the top. Emulate `prefers-reduced-motion` so the assertion doesn't wait on the animation. If the harness has no
  helper for this, poll `scrollTop` until it stops changing.
- **Arrow keys rest:** `{ArrowDown}` ×3 from `h9` leaves `h12` at the top.
- **Side-effect column:** in an empty field, picking `h9` fills `m0`, and the minute column rests `m0` at the top.
  With `min="09:30"`, picking `h9` from `10:15` clamps the minute to `m30`, which rests at the top.
- **Untouched column:** scroll the minute column by hand, pick an hour that keeps the minute, and the minute
  column's `scrollTop` is unchanged.
- **Fitting column:** the period column and `minuteStep: 15` have no inline padding and `scrollTop === 0` after a
  pick.
- **No blank rows:** `column.querySelectorAll('li').length` equals the options (24 / 60), and every `li` has
  `role="option"`.
- **Fullscreen** (`describe('fullscreen panel')`, viewport 360×740):
  - `h14` sits at the middle of its column, within 1px of both centre lines;
  - `h0` and `h23` can reach the middle, because the padding exists at both ends;
  - a pick rests the new row in the middle.
- **Reduced motion:** under emulated `prefers-reduced-motion: reduce`, a pick lands in one frame.

Docs and baselines:

- **`usage.md`:** in "The columns", say that the selected row rests at the top of its column (the middle on a
  narrow viewport) and returns there after each pick, and that scrolling alone never picks. In "Narrow viewports",
  mention the middle.
- **Baselines:** the open-panel, twelve-hour, range and fullscreen screenshots may change because of the padding
  and the resting position. Delete and rewrite the affected PNGs one file at a time (`--update` last), then review
  them.
- **Changeset:** a patch changeset for both packages, "c-time-picker keeps the selected row at the top of its
  column (the middle on narrow viewports) after every pick." This is its own `Feat(c-time-picker)` commit, with
  commits only when asked.

## Verification

- **Browser, one file per run:** `CTimePicker.spec.ts`, then the conformance suites filtered to `c-time-picker`
  (anchored-overlays, value-controls, all-components).
- **Node and static checks:** `pnpm ui test:node`, `type-check`, `lint`, and a csc-ui build (the docs example smoke
  mounts the canons).
- **Manual:** check the smooth scroll and the fullscreen middle in the docs dev server at a phone width. The
  Firefox 140 ESR and screen-reader checks are still outstanding from the first build. With a screen reader,
  confirm the option count doesn't include the padding.

## Risks

- **Smooth scroll under key repeat:** each press starts a new `scrollTo`, and Chromium retargets it. Check that
  holding ArrowDown doesn't lag behind the focus.
- **Peek cap and padding:** a consumer who changes the column's padding through `::part(column)` changes the room
  too, because it's measured. That's intended, but the specs should use the default styles.
