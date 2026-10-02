# Fullscreen picker panels commit with Done; the X cancels

## Status

Built 2026-10-02. Step 0 landed as 219a91e7 (Today/Now) and 79f82207 (centring
fix); this work is uncommitted. Where the build differs from the steps below:

- Enter on a disabled day, or on a disabled year row, does nothing: it never
  presses Done.
- Under a month range, a new year on the end's year step changes the end and
  keeps the pending range's start.
- The time panel's fullscreen action row is capped at 400px and centred, as
  in the date panel.
- The new time specs were run against the committed SFC (6 of 7 fail; the
  Enter case already passed).

## Context

On a narrow viewport (the **fullscreen panel**) the two pickers commit differently, and
neither offers a way to back out:

- **c-date-picker:** a pick commits and closes (ADR-0058).
- **c-time-picker:** every pick in a time column commits live and the panel stays open
  (ADR-0062), so the heading row's X is effectively "submit".

The user wants both pickers on a phone to collect picks in the panel, commit them with a
separate button, and have the X cancel.

This reverses ADR-0058's and ADR-0062's "no OK/Cancel row" for the fullscreen layout only.
It also changes ADR-0065's "Today/Now commit and close" there.

## Decisions (grill session 2026-10-02)

1. **Layout:** the fullscreen panel only. The anchored panel is unchanged: one-pick commit
   for dates, live commit for times, light dismiss.
2. **Components:** `c-date-picker` and `c-time-picker` only. The multiple-selection
   fullscreen panels (c-select, c-autocomplete, c-tree-select) keep live toggles, and the
   ADR records that their X still means "close".
3. **Pending value** (new glossary term): what the fullscreen panel's picks build up. It
   is shown in the panel, never emitted, and discarded on every exit except Done. The
   pending start becomes the first half of a pending range. _Avoid_: draft, selection,
   staged value.
4. **Done button:**
   - Placement: at the end of a row under the body. Today/Now move to the start of the
     same row.
   - Look: filled primary (c-button's filled look: `bg-primary text-on-primary
     hover:bg-primary-hover`, `rounded-csc-md`, bold), built as a native button because
     the focus trap only reaches native buttons.
   - Label: "Done", via `texts.done`.
   - It is the last Tab stop. The shared `PanelHeadingRow` is unchanged.
5. **Done's rules:**
   - Always enabled, except while a pick is half done: a date range's pending start, or
     in month mode a month picked without its year. Then it is disabled, so the trap skips
     it, and picks still never produce a half range.
   - With no pick it changes nothing: no `change`, and bad-input text stays. It just
     closes, like the X.
6. **Today / Now** in the fullscreen panel select and wait for Done:
   - Today is still exactly a press on today's cell. It navigates to today's month,
     focuses the cell and selects it, and under range it becomes the pending start or
     completes the range.
   - Now moves the edited end's columns to the current minute.
7. **Keyboard:**
   - Escape cancels, like the X.
   - Enter on a day cell or a time row selects it, then acts as Done. When that
     completes nothing (a range's first day) it only selects.
   - Space only selects. Arrow keys in a time column move the selection without
     committing.
8. **Month mode:** after the year pick the panel stays on the year step. The year is
   checked, the month's summary row stays above it, and Done is enabled. Under range it
   stays on the end's year step.
9. **Other exits:** every way out except Done discards: the X, Escape, crossing the
   narrow-viewport threshold (ADR-0050 closes the panel), the field being disabled.
10. **Time range:** both ends' picks are held across the end switch, and Done commits
    them in one `change`.
11. **Unchanged:**
    - The X's accessible name stays `texts.closePanel` = "Close".
    - There are no new announcements: `aria-selected` carries a pick, and the pending
      start keeps its message.
12. **Records:** a new ADR-0066, plus dated "_Amended by ADR-0066_" lines on the
    overridden bullets of ADR-0058, 0062 and 0065.

## Step 0: commit the pending work first

Commit only these files. Leave `.devcontainer/Dockerfile` and `_plan/firefox-*.md` alone:
they aren't from this work.

- **Commit 1:** `Feat(c-date-picker, c-time-picker): Add Today and Now buttons`, with
  `.changeset/picker-today-now-buttons.md`. Files: CONTEXT.md, ADR-0065, both SFCs, both
  specs and new PNGs, both usage.md files, both api snapshots, tag-name-map.ts, the docs
  `today.*` / `now.*` examples, `_plan/picker-today-now-buttons.md`.
- **Commit 2:** `Fix(c-time-picker): Rest every fullscreen column's selection in the
  middle`, with `.changeset/time-picker-fullscreen-centre-fitting-columns.md`. Files: the
  `fitColumn` hunk, its spec plus the renamed spec, the ADR-0062 bullet, the time
  usage.md Narrow viewports sentence.
- **Splitting files between the commits:** CTimePicker.vue, CTimePicker.spec.ts and the
  time usage.md hold both changes, so stage the Feat hunks first. Use `git apply --cached`
  with a hand-split patch, since interactive `git add -p` is unavailable.
- **Index race:** watch for the Zen index race (memory). Check `git diff --cached --stat`
  counts before each commit, and recover with `git reset --mixed <prev HEAD>`.
- **Before committing:** run the CI type-check. Both spec files already pass.

Then copy this plan to `_plan/fullscreen-picker-done-button.md` (repo convention).

## Step 1: glossary and ADRs

- **`CONTEXT.md`:**
  - Add **Pending value** and **Done button**. Done button: "the fullscreen panel's only
    commit"; _Avoid_: OK, Save, Apply, confirm, submit.
  - Amend **Pending start**: in the fullscreen panel, the first half of a pending range.
  - Amend **Today button** and **Now button**: in the fullscreen panel they select into
    the pending value instead of committing.
  - Amend **Time column**: "moving in a column commits" now holds in the anchored panel;
    in the fullscreen panel it selects.
  - Amend **Fullscreen panel**: the pickers' panel ends in a row with Done, and its close
    control discards.
- **`docs/adr/0066-fullscreen-picker-panels-commit-with-a-done-button.md`:**
  - The decisions above.
  - Rejected alternatives, from the grill options: every layout; every fullscreen panel;
    the heading-row placement; Cancel + Done; OK/Select/Save; text weight; Today/Now as a
    shortcut; a disabled-until-change Done; committing what's shown; `{start, end:null}`
    or a one-day range; Enter select-only; committing on rotation; the label "Cancel";
    announcing every pick.
  - Consequences: `change` timing on phones; existing fullscreen baselines; the c-select
    X divergence.
- **ADR-0058, 0062, 0065:** add a one-line dated amendment pointer on the bullet each
  overrides. That's 0058 "A pick commits and closes", 0062 "Live commit … no OK/Cancel
  row", and 0065 "Today = pressing today's cell … closes" / "Now commits … and closes".

## Step 2: c-date-picker (`components/c-date-picker/CDatePicker.vue`)

- **State:**
  - `confirming = computed(() => layout.value === 'fullscreen')`.
  - `pendingValue = ref<TypedFieldEnds | null>(null)`.
  - `panelEnds = computed(() => pendingValue.value ?? ends.value)`.
- **Read `panelEnds` instead of `ends`** in `isSelected`, `bandSpan` and `stepTarget`.
  `stepTarget` drives the month and year `selected` states.
- **`pick(iso)`** (~L1568): the two committing branches become a helper. When
  `confirming`, it sets `pendingValue` and keeps the panel open; otherwise it calls
  `commitValue` + `closePanel(true)`. A pick after a complete pending range starts a new
  pending start, as today.
- **`commitMonth(month)`** (~L1790): when `confirming`, the complete branch sets
  `pendingValue` and stays on the year step (`enterStep(range ? 'end-year' : 'start-year')`
  when not already there).
  - The year-step summary shows `draftMonth ?? stepTarget`'s month.
  - The start summary shows `pendingStart ?? pendingValue.start` on the end steps.
  - Year-row `disabled` uses `draftMonth ?? stepTarget`'s month.
- **`pickToday`** (~L1989): when `confirming`, always navigate to today's month and
  focus today's cell (today this only happens for a range's first press), then
  `pick(today)`. In month mode, `commitMonth(thisMonth)` handles it via the
  `confirming` branch.
- **Done:** `doneDisabled = pendingStart !== null || draftMonth !== null`.
  `pickDone()`: return if disabled; `if (pendingValue) commitValue(pendingValue)`;
  `closePanel(true)`. Commit before closing: `onClosed` runs after `openLayout` resets.
- **`onGridKeyDown` Enter:** `pick(day)`, then `if (confirming && !doneDisabled) pickDone()`.
  Space: `pick` only. In month mode the Enter on a list row (`onListKeyDown`) follows the
  same rule.
- **`onOpened` / `onClosed`:** `pendingValue.value = null`. Every discard path (X,
  Escape, threshold watch, disable) goes through `onClosed`.
- **Template:**
  - The actions row renders when `showTodayResolved || layout === 'fullscreen'`.
    Today goes at the start and `<button part="done">` at the end. Use
    `justify-between` in fullscreen; anchored with only Today keeps `justify-end`, so
    the anchored baselines are unchanged.
  - Add `@csspart done` to the docblock.
  - Add `done: 'Done'` to the texts type and `DEFAULT_TEXTS`.
  - Add a tv slot `done`: the filled look, 44px tall (the heading row's touch target).
    The fullscreen variant raises Today to 44px too.

## Step 3: c-time-picker (`components/c-time-picker/CTimePicker.vue`)

- **State:** the same `confirming` / `pendingValue` / `panelEnds`. `committed`
  (~L661) reads `panelEnds`, so the columns, `selected` and the fill-in rules follow the
  pending value.
- **`pickPart`** (~L731): when `confirming`, set
  `pendingValue = { ...panelEnds, [end]: time }`; otherwise `commitValue`.
- **Enter** (~L850): `pickPart`, then `pickDone()` (when anchored, `pendingValue` is null
  and it just closes, so the anchored behaviour is unchanged).
- **`pickNow`** (~L920): when `confirming`, snapshot the columns, set the pending end to
  now, and rest the moved columns with the existing `afterPick` rest loop. Don't move
  focus off the Now button. Otherwise it behaves as today.
- **Done:** never disabled (there's no pending start). `pickDone()` commits
  `pendingValue` if set, then `closePanel(true)`.
- **Add `onClosed: () => { pendingValue.value = null }`** and reset it in `onOpened`.
- **Template / docblock / texts / tv:** as for the date picker (the `actions` row
  always in fullscreen, the Now button at the start, `part="done"`).

## Step 4: specs and baselines

New `describe('Done button (ADR-0066)')` in both spec files, at viewport 360×740 with an
`afterEach` reset to 1280×800.

- **Date picker:**
  - A pick sets `aria-selected`, emits nothing and the panel stays open. Done emits one
    `change`, closes and returns focus.
  - The X discards, Escape discards, and crossing the threshold (`page.viewport(1280, 800)`
    while open) discards. After reopening, the committed day is still the selected one.
  - Range: after the first pick Done is disabled and Tab skips it; the second pick
    enables it; Done commits the range in order.
  - Enter on a cell commits and closes; Enter on a range's first day only selects.
  - Done with no pick emits nothing.
  - Today selects today and stays open; then Done commits.
  - Month mode: the year pick stays on the year step with the summary; Done commits
    `'YYYY-MM'`; Done is disabled between the month and year picks; a month range.
  - The anchored panel still commits on pick (existing specs cover it).
- **Time picker:**
  - Picks, arrows and Now emit nothing and the panel stays open; Done commits once.
  - The X and Escape discard.
  - Range: picks on both ends across the end switch, then one `change` with both.
  - Enter commits and closes.
  - Done with no pick on an empty field leaves `null` and emits nothing.
- **Existing spec update:** the time spec "a column that fits a tall panel…" expects
  `16:30` after a click. It should assert the selection and the centring, then press Done.
- **Check:** check the ADR-0065 "bottom edge" specs still hold with Done in the row.
- **Visual:** a new `fullscreen-panel` baseline per mode for each picker (none exists
  today), with `show-today` / `show-now` on so the row shows both buttons. Run one spec
  file per invocation, and put `--update` last.

## Step 5: docs, generated files, release

- **usage.md:**
  - Date picker: the Range/Today wording ("commits and closes" → anchored), plus the
    Narrow viewports section: picks collect until Done, and X/Escape discard.
  - Time picker: the live-commit paragraph and the key table (Enter/Escape in the
    fullscreen panel), the Now section, and Narrow viewports.
- **Generated files:** `pnpm run docs:manifest`, `pnpm run docs:tag-map`, and the api
  snapshots via `npx vitest run src/api-snapshot.node.spec.ts --project node -u`. The
  React wrappers rebuild from the manifest.
- **Changeset:** `.changeset/fullscreen-picker-done-button.md`, minor for both packages
  (a user-facing interaction change, as ADR-0050 was released).
- **Memory:** update the Today/Now and time picker memories, and add one for this
  decision.

## Verification

- `npx vitest run src/components/c-date-picker/CDatePicker.spec.ts --project browser`,
  then the time picker spec. Run one file per invocation because of the OOM memory. New
  specs must fail before the change: write them first.
- `pnpm ui lint`, the CI type-check step, `pnpm ui build` (grep dist for the new `done`
  utilities: the new-SFC scan memory), `pnpm --filter @cscfi/csc-ui-react build`, docs
  lint + parity.
- Firefox 140 via the BiDi driver at 360×740 on the docs examples: tap a day, then the
  X, and confirm no `change` and the old value; pick, then Done, and confirm a commit;
  repeat on the time picker with a range.
- Leave the full suite, the conformance suites and the docs viewport smoke to CI.
