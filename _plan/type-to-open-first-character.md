# Fix: first typed character lost when typing into a closed c-autocomplete

## Context

Typing `finland` into a closed `c-autocomplete` opens the panel with the query
`inland`; the default prefix filter then matches nothing. `c-tree-select`
shares the code and the bug.

### Root cause

`onFieldKeyDown` (`packages/csc-ui/src/components/c-autocomplete/CAutocomplete.vue:1483-1498`):
a printable key calls `openPanel()` (sync `showPopover()`), then schedules
**rAF A**: `setQuery(event.key)` + writes the search input's value.

`showPopover()` *queues* the `toggle` event as a separate task. `onOpened`
(`CAutocomplete.vue:1392-1406`) runs inside it and does the open-reset
`query.value = ''` + `emit('change:query', '')`, then schedules **rAF B**
(focus the search input, seed the highlight).

1. **Reset clobbers the seed**: when a frame boundary falls between the
   keydown task and the toggle task, rAF A runs first (query = `f`), the
   toggle's open-reset sets `''`, Vue patches the search input back to `''`,
   rAF B focuses it, and the following keys type `inland`. This is the
   reported bug.
2. **Keys typed before focus are dropped**: keystrokes that arrive between
   the keydown and rAF B's `focus()` land on the readonly value field. By then
   `isOpen` is true, so `onFieldKeyDown` ignores printable keys. A fast typist
   or a scripted burst loses more characters.

`c-tree-select` has the same code (`CTreeSelect.vue:1587-1602`, `onOpened` at
`1524-1539`).

## Decisions (grilled 2026-10-21)

| # | Decision | Choice |
|---|---|---|
| 1 | How the key reaches the search input | **Native typing**: in keydown, open, focus the search input synchronously, and **no** `preventDefault`. The browser then types the key into the newly focused input through the normal `input` path. Fixes both loss modes and removes the rAF seed. |
| 2 | Where the open-reset lives | A new optional **`onOpening`** hook on `useAnchoredPanel`. It runs inside `open()` after the disabled / already-open / no-API guards and right before `showPopover()`. Only these two components pass it. |
| 3 | `change:query` on a typed open | **`''` then `'f'`**: the contract stays as ADR-0029 and the glossary describe it. No ADR, glossary or usage.md change. |
| 4 | Highlight after a typed open | **First match**, the same as opening and then typing. The open seed prefers the selection only while the query is empty. |
| 5 | Scope | **Both components in one commit**, with one changeset and a spec that fails first in each component. |

No CONTEXT.md change: the glossary's **Query** entry ("resets to empty
whenever the panel opens, … the open-reset included") still holds. No ADR:
the change is easy to reverse and involves no real trade-off.

## Plan

### 0. Copy this plan to `_plan/type-to-open-first-character.md` (memory: plans live in the repo's `_plan/`)

### 1. `packages/csc-ui/src/shared/useAnchoredPanel.ts`
- Add `onOpening?: () => void` to `UseAnchoredPanelOptions`, with a doc
  comment: it runs inside `open()`, synchronously before `showPopover()` and
  only when the panel really opens. It holds state that must be in place
  before the first keystroke reaches the panel (the query reset), as opposed
  to the open sequence in `onOpened`, which runs once `toggle` confirms.
- In `open()`, call `options.onOpening?.()` after the layout and measurement
  and immediately before `p.showPopover()`.
- Update the header doc ("What stays in the consumer… the open sequence…",
  lines 45-52) to name the split.

### 2. `CAutocomplete.vue`
- `useAnchoredPanel({ onOpening })`: move `query.value = ''` and
  `emit('change:query', '')` out of `onOpened`. `onOpened` keeps only its rAF
  (cap, focus, seed, status).
- Update the comment above the `useAnchoredPanel` call (lines 1371-1373,
  "so `change:query` still fires within that event"): the reset now runs in
  `onOpening`, before `showPopover()`.
- `onFieldKeyDown`, printable branch: `openPanel();
  searchRef.value?.focus({ preventScroll: true });`. Drop the rAF block
  (`setQuery` / the manual `.value` write / `activeIndex`). Update the comment
  to say focus moves during keydown so the browser types the key into the
  search input. `preventScroll` covers Firefox 140, where Floating UI only
  places the panel in the toggle handler.
- `seedActiveIndex`: prefer the selected row only while `query.value` is
  empty. Otherwise use `firstEnabledIndex()`, the same rule as
  `onSearchInput`.

### 3. `CTreeSelect.vue`
- The same `onOpening` move for the query reset. Move the `pathValues` reset
  with it, so all reopen state is in place before the first keystroke.
- The same printable-branch rewrite in `onFieldKeyDown`, dropping the rAF
  `setQuery` / `.value` write / `settleHighlight()`.
- The `onOpened` rAF calls `settleHighlight(searchMode.value ? null :
  committedValue.value)`, the same as `onSearchInput`.

### 4. Specs (written first; confirm that they fail on the current code)
- `c-autocomplete/CAutocomplete.spec.ts`, `describe('query')`:
  - **Burst**: focus the combobox, run `userEvent.keyboard('python')`, then
    settle. Check that the panel is open, `search(m).value === 'python'`,
    `rows(m)` is just Python and highlighted, and the `change:query` details
    are `['', 'p', 'py', …, 'python']`.
  - **Key, then a frame, then the rest** (loss mode 1): `keyboard('p')`,
    `settle()`, `keyboard('ython')`, with the same assertions on value and
    rows.
  - **Highlight**: mount with `items` Faroe Islands / Fiji / Finland / France
    and Finland selected. Type `f` on the closed field and check that the
    active row is Faroe Islands.
- `c-tree-select/CTreeSelect.spec.ts`, `describe('opening')`: the burst case
  with a query that matches a known `TREE` leaf. Check that the search input
  holds the whole query and that search mode lists the leaf.

### 5. Changeset: `.changeset/type-to-open-keeps-first-character.md`
`"@cscfi/csc-ui": patch` + `"@cscfi/csc-ui-react": patch`, user-facing:
> Typing into a closed `c-autocomplete` or `c-tree-select` field now opens the
> panel with every typed character in its search input. Before, the first
> character could be lost (typing `finland` searched for `inland`), and fast
> typing could drop more. After such an open the highlight lands on the first
> match, as it does when typing into the open panel.

### 6. Commit
`Fix(c-autocomplete, c-tree-select): Keep every character typed into a closed field`
(spec + fix + changeset together). Gate the commit on tree counts (index-race
memory).

### Out of scope
- AltGr / Option characters (`ctrlKey`/`altKey` chords such as `@` on Finnish
  layouts) still don't open the panel by typing.
- IME composition on the closed field (`key === 'Process'`).

## Verification
1. Red first: add the specs, then run
   `pnpm ui exec vitest run src/components/c-autocomplete/CAutocomplete.spec.ts -t "query"`
   (one spec file per run, because of devcontainer OOM). The new cases fail.
   Repeat for `CTreeSelect.spec.ts -t "opening"`.
2. Apply the fix. Both files are green, including the existing
   `emits change:query "" on every open` and the open-path specs.
3. Run the full spec files for both components plus any other
   `useAnchoredPanel` consumer specs that are affected (date/time/colour
   pickers don't pass the hook, so a quick run of each is enough).
4. Run `pnpm lint` and the CI type-check step (the specs' types; see the
   "run CI type-check" memory).
5. Manual check in Firefox 140 ESR (the headless recipe from memory): typing
   `finland` on the closed field yields `finland` in the search input. This
   confirms that Gecko routes the keypress to the element focused during
   keydown, and that the page doesn't jump when the panel uses the fallback
   placement.
6. Docs dev server (`pnpm dev`): type quickly into the closed autocomplete and
   tree-select examples, including the external example (`''` then the
   query).
