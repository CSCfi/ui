# Select-all row for `c-select` / `c-autocomplete` in `multiple` mode

## Context

ADR-0044 gave `c-select` and `c-autocomplete` a `multiple` mode (array `value`,
decorative row indicator, tags in the field) and explicitly deferred bulk
selection ("each extra can land later behind its own prop"). Consumers now want
to pick every option at once: a row pinned at the top of the option list that
selects all listed options, with consumer-customizable text. This plan records
the grilled decisions and the implementation.

## Decisions (grilling log, all confirmed with the user)

1. **Opt-in shape** — boolean `select-all` prop on both fields; label via
   `texts.selectAll` (ADR-0044's rule: user-visible strings go through
   `texts`; `no-results-text` was removed for this reason). No per-string
   prop, no slot.
2. **Scope of "all"** — the *listed* enabled options: every option in
   c-select, the current matches in c-autocomplete while a query is typed, the
   items handed over in `external` mode. Additive: listed-but-unselected
   options are appended; nothing outside the list is touched. (Mirrors the
   data table's "select all (filtered) rows".)
3. **Row state** — tri-state toggle with constant text: shared
   `SelectionIndicator` (already draws `indeterminate`) reads none / some /
   all. Activating a checked row unselects the listed options; otherwise it
   selects them. The label never swaps.
4. **Placement** — pinned at the top of the listbox (`position: sticky`,
   overlay-surface fill, divider hairline below) *inside* the scrolling `<ul>`
   so it stays in the ARIA listbox and the arrow order. Not an item row: the
   peek cap and `items-per-page` count option rows only.
5. **Keyboard** — topmost navigable row but never the automatic landing spot:
   open-seeding and query re-seeding keep targeting the first enabled option.
   ArrowUp from the first option, or Home, reaches the row; Enter/Space there
   toggles all listed; c-autocomplete's wrap passes through it; in c-select
   ArrowUp on the row closes the list (today's index-0 behaviour moves up one
   slot).
6. **Text shape** — `texts.selectAll?: (count: number) => string`, count =
   listed enabled options; default `() => 'Select all'`.
7. **Vocabulary** — **select-all row**; part `select-all`. _Avoid_:
   select-all item, select-all option, header checkbox, check all.
8. **ADR** — yes, ADR-0046 amending ADR-0044.

Routine calls (stated, not asked): disabled options are never toggled nor
counted; the row renders only in `multiple` mode with ≥1 listed enabled option
(`select-all` ignored in single mode, like `option-as-selection` in multiple);
one value emission per activation (plus `change` in c-autocomplete); selection
order per ADR-0044 (`return-object` appends `{ name, value }`); the row is a
`role="option"` listbox child with `aria-selected` true only in the "all"
state, mixed state visual + live region, indicator `aria-hidden`.

## Implementation

### 0. New shared module `packages/csc-ui/src/shared/selectAll.ts`

```ts
export const SELECT_ALL_INDEX = -1;          // c-select ↔ c-dropdown `index` contract
export type SelectAllState = 'all' | 'none' | 'some';
export const selectAllState = (listed: readonly (number|string)[], selected: ReadonlySet<number|string>): SelectAllState;
/** all listed selected → drop every listed value (others keep order);
 *  otherwise append the unselected listed ones in list order (ADR-0044). */
export const toggleAllValues = <T>(current: readonly T[], listed: readonly { label: string; value: number|string }[],
  valueOf: (v: T) => number|string, make: (o: { label: string; value: number|string }) => T,
): { added: { label: string; value: number|string }[]; next: T[]; removed: (number|string)[] };
```

`listed` already excludes disabled options (callers filter). `SelectAllState`
must never appear in an SFC prop type (tag-map generator inlines local
declarations). Duplicate option values collapse in the Set math — same
limitation as `toggle`/`toggleValue`; say so in a comment.

### 1. `c-dropdown` (`src/components/c-dropdown/CDropdown.vue`, internal element)

Parent computes, dropdown renders — the action (value ownership,
`return-object` shape, `syncMultiple`) must live in c-select anyway, so one
derivation there is the single source.

- **Prop** `selectAllRow?: CDropdownSelectAllRow | null` (default `null` =
  hidden), local prefixed interface `{ label: string; selected: number;
  state: 'all' | 'none' | 'some'; total: number }` (inline union, no alias).
  `index` doc: "`-1` is the select-all row".
- **Event map** `CDropdownEvents`: `selectall: void` (all-lowercase, ADR-0017),
  emitted with the existing `bubbling` init.
- **Template**: first child of the `<ul>`, before both `v-for` templates:
  `<li v-if="selectAllRow" ref="selectAllRef" :aria-selected="state === 'all'"
  :class="dropdown({ selectAll: true }).item()" :data-name="label"
  data-select-all part="select-all" role="option" tabindex="-1"
  @click="onSelectAll">` containing `<selection-indicator :checked="state ===
  'all'" :indeterminate="state === 'some'" class="relative" />` and `<span
  class="c-dropdown__label">{{ label }}</span>`. No `aria-pos-in-set` /
  `aria-set-size` on it (those stay option-only; their misnamed attributes are
  pre-existing, do not touch).
- **Positional-NodeList hazard**: replace every
  `querySelectorAll('li[role="option"]')` with two helpers —
  `optionRows()` = `li[role="option"]:not([data-select-all])` and
  `rowAt(index)` (`null` → undefined; `SELECT_ALL_INDEX` → `selectAllRef`;
  else `optionRows()[index]`). Sites: `updateStatusText` (~:550), `focusItem`
  (~:642), `selectItem` (~:653), the `props.index` watcher (~:696), the peek
  `rows` in `applyListCap` (~:746).
- `onSelectAll = () => { emit('selectall', undefined, bubbling); updateStatusText(); }`
  (a keyboard toggle leaves `index` at -1 so the index watcher does not
  re-fire; the explicit call re-announces the new counts after the debounce).
- `updateStatusText`: new branch when `props.index === SELECT_ALL_INDEX &&
  props.selectAllRow` → `` `${label} - ${selected} of ${total} options selected` ``;
  option-row position/total come from `optionRows()` so the row never shifts
  them.
- Cap watcher: add `() => !!props.selectAllRow` to `watch([itemsArray,
  isMobile, …])` — the row appearing changes list height; keep the rAF
  deferral (post-flush watchers measure stale rows).
- **tv**: `defaultVariants.selectAll: false`; variant `selectAll.true.item`:
  `sticky top-0 z-10 rounded-none bg-surface-overlay border-b border-solid
  border-divider hover:aria-selected:rounded-none focus:aria-selected:rounded-none`.
  `z-10` is load-bearing: each option row's `<selection-indicator
  class="relative">` is positioned and later in tree order, so without a
  stacking context they paint over the pinned row when scrolled under it.
- Docblock: `@csspart select-all - The pinned select-all row at the top of the
  list in multiple mode; carries the same indicator / mark parts as an option
  row`.

### 2. `c-select` (`src/components/c-select/CSelect.vue`)

- **Prop** (`CSelectProps`, alphabetical after `returnObject`):
  `selectAll?: boolean` — "In `multiple` mode, pin a select-all row at the top
  of the list. Its checkbox shows whether none, some or all enabled options
  are selected; activating it selects every enabled option — or, when all are
  selected, unselects them. Ignored in single mode". `withDefaults`:
  `selectAll: false`.
- **Texts**: `CSelectTexts.selectAll?: (count: number) => string` ("Label of
  the select-all row; receives the number of enabled options listed");
  `DEFAULT_TEXTS.selectAll: () => 'Select all'`.
- **Parts**: docblock `@csspart select-all - The pinned select-all row at the
  top of the list (multiple mode with select-all)`; template `exportparts="menu,
  list, item, select-all, indicator, mark"` (:13) and `STATIC_EXPORTED_PARTS`
  (~:1141) must agree (lint checks both against `@csspart`).
- **Template**: `<c-dropdown … :select-all-row="selectAllRow">`.
- **Computeds**: `selectAllOn` host-attribute-first like `multipleOn`
  (:464-469 — Boolean attribute props reset on re-render); `listedEnabled` =
  `dropdownItems.filter(i => !coerceBoolean(i.disabled))` (after
  `dropdownItems`, :576; same test as c-dropdown's `isDisabled`);
  `selectAllShown` = `multipleOn && selectAllOn && listedEnabled.length > 0`;
  `selectAllRow` = `null` when hidden, else `{ label: t.selectAll(n),
  selected, state: selectAllState(listed, new Set(selectedValues)), total: n }`.
- **Value plumbing**: `toggleAll()` beside `toggleValue` (:720-739): `const {
  next } = toggleAllValues(rawValues, listedEnabled.map(i => ({ label:
  nameOf(i), value: i.value })), valueOf, o => returnObject ? { name: o.label,
  value: o.value } : o.value)`; `emitValue(next)` once; `syncMultiple()`.
- **Dropdown events**: `onSelectAll = () => { currentIndex.value =
  SELECT_ALL_INDEX; toggleAll(); }`; register with `addEventListener('selectall',
  onSelectAll)` in `onMounted` beside `selectOption` (:1229) and remove in
  `onBeforeUnmount` (:1276). In `onDropdownStateChange` (:842), when the list
  closes and `currentIndex === SELECT_ALL_INDEX` → `null` (never a
  "remembered row" to re-toggle on the next open).
- **Keyboard** (`handleKeyDown`, :977-1116), with `const top = selectAllShown
  ? SELECT_ALL_INDEX : 0`: ArrowDown unchanged (`-1 → Math.min(0, …) = 0`);
  ArrowUp: `if (currentIndex === top) { close(); inputRef.focus(); return; }`
  then `Math.max(currentIndex - 1, top)` + `focusItem`; Home →
  `currentIndex = top`. End, Space, Enter, Escape, Tab, type-ahead unchanged
  — `toggleRowFromKey` (:962-975) already works (the row matches
  `li[role="option"]` → `click()`; else `selectItem(-1)` → `rowAt`).
  `seedCurrentIndexFromSelection` (:948) and `getSelectionIndex` only produce
  `≥ 0` or `null`, so seeding never lands on the row. `updateStatusText`
  (:914) unchanged (the -1 announcement is c-dropdown's).

### 3. `c-autocomplete` (`src/components/c-autocomplete/CAutocomplete.vue`)

- **Prop/Texts/Docblock**: as c-select; the prop doc adds "selects every
  enabled option currently listed — the matches while a query is typed, the
  given `items` with `external`". `CAutocompleteTexts.selectAll`,
  `DEFAULT_TEXTS.selectAll: () => 'Select all'`, `@csspart select-all`.
- **Sentinel**: `const SELECT_ALL_ROW = -2` for `activeIndex` (`-1` stays
  "none"). Numeric so unhandled sites fail closed (`filteredOptions[-2]`,
  `` `${id}-opt--2` ``, `i === -2` are all no-ops); the enumeration below is
  the exhaustiveness check.
- **Computeds** (after `activeIndex`, :687 / after `filteredOptions`, :829):
  `selectAllOn` (host-attribute-first), `listedEnabled` =
  `filteredOptions.filter(o => !o.disabled)`, `selectAllShown`,
  `selectAllState` (import the helper under an alias to avoid shadowing),
  `isSelectAllActive`, `activeDescendantId` (`${id}-select-all` | `${id}-opt-N`
  | undefined), helper `firstEnabledIndex()` replacing the five inline
  `findIndex(o => !o.disabled)` copies. Any new local alias must be
  `Autocomplete…`-prefixed.
- **Template**: search input `:aria-activedescendant="activeDescendantId"`.
  First `<ul>` child (before the loading/no-results rows): `<li
  v-if="selectAllShown" :id="`${id}-select-all`" :aria-selected="state ===
  'all'" :class="autocomplete({ selectAll: true }).item()"
  :data-active="isSelectAllActive || undefined" data-select-all
  part="select-all" role="option" tabindex="-1" @click="onSelectAll"
  @mousedown.prevent @pointermove="activeIndex = SELECT_ALL_ROW">` with the
  indicator (`:checked`/`:indeterminate`) and `<span
  :class="ui.itemLabel()">{{ t.selectAll(listedEnabled.length) }}</span>`.
  Option rows' `i === activeIndex` / `:id` bindings untouched.
- **Value plumbing**: extract the tail of `toggle` (:1034-1038: set `value`,
  `emitModelValue`, `emit('change')`, `syncOptionElements`) into
  `commitMultiple(next)`; `toggleAll()` = `toggleAllValues(rawValues,
  listedEnabled, valueOf, make)` → `removed.forEach(committedLabels.delete)`,
  `added.forEach(committedLabels.set)`, `commitMultiple(next)`.
  `onSelectAll = () => { toggleAll(); searchRef.focus(); updateStatusText(); }`
  (mirrors `onSelect`'s multiple path, :1079-1085).
- **Index sites**: `moveActive` (:1269) walks a virtual order
  `[SELECT_ALL_ROW?, …enabled option indices]`: from "none", dir=+1 → first
  option (skip the row), dir=-1 → last; otherwise `(pos + dir) mod length`
  (wrap passes through the row). Home (:1345) → `selectAllShown ?
  SELECT_ALL_ROW : firstEnabledIndex()`. Enter (:1329): `if
  (isSelectAllActive) { onSelectAll(); break; }` first. `scrollActiveIntoView`
  (:1359): early return when on the row (sticky ⇒ visible).
  `seedActiveIndex` (:1179), `onFieldKeyDown` printable branch (:1224ff),
  `onSearchInput` re-seed (:1293): `firstEnabledIndex()`, behaviour unchanged.
  `[filteredOptions, loading]` watcher (:1406): if on the row and the row is
  no longer shown → `firstEnabledIndex()`; else existing logic. `onToggle`
  close reset (`-1`) unchanged. Peek `applyListCap` (:772): `rows` =
  `li[role="option"]:not([data-select-all])`.
- **Live region** `updateStatusText` (:1372): first branch when on the row →
  `` `${t.selectAll(n)}, ${selectedCount} of ${n} options selected` ``; plus
  `watch(activeIndex, (now, before) => { if (now === SELECT_ALL_ROW || before
  === SELECT_ALL_ROW) updateStatusText(); })` so arriving on the row speaks
  the mixed state (`aria-activedescendant` alone reads name + selected).
- **tv**: `defaultVariants.selectAll: false`; variant `selectAll.true.item`:
  `sticky top-0 z-10 -mt-1 -mx-1 w-auto min-h-[46px] pt-3 px-[14px]
  rounded-none bg-surface-overlay border-b border-solid border-divider`. The
  `list` slot's `p-1` makes a `top-0` sticky child start 4px down and jump
  when it sticks; the negative margins pull the row to the scrollport edge and
  bleed fill + hairline to full width, `pt-3`/`min-h-[46px]` recreate the gap
  inside the opaque row, `px-[14px]` keeps label/indicator aligned with option
  rows. tailwind-merge resolves the conflicts against the base `item`
  classes. Verify visually and adjust geometry if needed.

### 4. Docs and release

- usage.md (both): `## Multiple selection` gains a paragraph (draft below) and
  a `::part(select-all)` snippet; `## Texts` adds "the select-all row's label".
- Docs examples: **new `select-all` example per component** (not an extension
  of `multiple.*`, which already carries three concepts; `useExamples.ts`
  titles it "Select all" from the file name). Five files each under
  `packages/csc-ui-documentation/app/examples/c-select/` and
  `…/c-autocomplete/`: `select-all.vue` (v-model, explicit `import { ref }`),
  `select-all.react.tsx` (`selectAll` prop), `select-all.angular.ts`
  (`select-all` attribute), `select-all.typescript.html` +
  `select-all.typescript.ts` — copy the `multiple.*` shapes
  (`check-example-parity.mjs` enforces the set). Include one `disabled`
  option; the autocomplete example's hint invites typing a query to show the
  "listed" scope and demonstrates a count-interpolated `texts.selectAll`.
- Regenerate, never hand-edit: `src/tag-name-map.ts` and the React wrappers
  (via the builds).
- Changeset `.changeset/select-all-row.md` (draft below). Commit:
  `Feat(csc-ui): Add a select-all row to c-select and c-autocomplete (ADR-0046)`.
- CONTEXT.md entry and ADR-0046 (drafts below).

## Documentation drafts

### CONTEXT.md — Form fields, after **Overflow tag**

```md
**Select-all row**:
The pinned first row of a **multiple** field's list that toggles every *listed* enabled option at once — the **query**'s matches in `c-autocomplete`, the given items in **external** mode — and whose **indicator** reads none, some or all. Opt-in per field; it carries no value, so it is not an option, and the arrow keys reach it but never land on it by default.
_Avoid_: Select-all item (an item is an `items` entry), select-all option (it holds no `value`), header checkbox (the data table's select-all affordance), check all
```

Also extend the **Multiple** entry: "… and the panel stays open; an opt-in
**select-all row** toggles every listed option at once."

### docs/adr/0046-select-all-row-is-a-pinned-option-row.md

Frontmatter `status: accepted`; sections as ADR-0045.

- **Summary**: `c-select` and `c-autocomplete` in `multiple` mode gain an
  opt-in `select-all` row — a `role="option"` row pinned at the top of the
  listbox that selects, or when every one is selected unselects, every enabled
  option currently listed; tri-state indicator; label `texts.selectAll(count)`.
  Amends ADR-0044, which deferred it.
- **Context**: ADR-0044 deferred bulk selection. The precedent is
  `c-data-table`'s header checkbox + two-step banner (`selectPage`,
  `selectAllItems(count)`), which selects "all (filtered) rows" and hides in
  `external` mode. A listbox has two places for such a control: a real
  checkbox in the panel header (PrimeVue MultiSelect's shape) or a row inside
  the list.
- **Decisions**: a row in the listbox, not a header control (different focus
  models per field — real row focus vs virtual highlight where Tab closes the
  panel — make a header checkbox an unreachable tab stop, and a nested
  interactive control ADR-0044 rejected); "all" = listed enabled options,
  additive (external's full set is unknowable; disabled never touched);
  tri-state with constant text, `aria-selected` only in "all" (mixing
  `aria-selected`/`aria-checked` in one listbox is discouraged), mixed state
  visual + live region; pinned, excluded from `items-per-page`/peek
  (ADR-0043); never the landing highlight ("type, Enter" still picks one
  match); label via `texts.selectAll(count)`, boolean prop as the switch.
- **Considered alternatives**: `c-checkbox` in the panel header;
  `select-all-text` string prop as the switch (reintroduces what ADR-0044
  removed); "all" regardless of the query (invisible options, impossible in
  external); swapping the label to "Deselect all".
- **Consequences**: `c-dropdown` gains `selectAllRow` + lowercase `selectall`
  event; three SFCs gain the `select-all` part; CONTEXT.md gains **Select-all
  row**; c-select's "ArrowUp at the top closes" moves up one slot when shown.

### .changeset/select-all-row.md

```md
---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

c-select and c-autocomplete gain a `select-all` attribute for `multiple` mode
(ADR-0046): a row pinned at the top of the list that selects every listed
enabled option — in c-autocomplete, the current matches — and unselects them
again when they are all selected, with a checkbox indicator that reads none,
some or all. Its label is `texts.selectAll`, a function receiving the number
of listed options (default "Select all"), and the row is stylable through
the new `select-all` part.
```

### usage.md paragraph (adapt per component)

"Set `select-all` to pin a select-all row at the top of the list. Its checkbox
shows whether none, some or all enabled options are selected; activating it
selects every enabled option — or unselects them all when they already are;
disabled options are left alone. [c-autocomplete: 'All' means the options
currently listed: the matches while a query is typed, or the `items` you
supply with `external`; options outside the list keep their state.] Its label
is `texts.selectAll`, a function receiving the listed count; the row is
stylable through the `select-all` part."

## Verification

1. `cd packages/csc-ui && pnpm build` — strict manifest lists `select-all`
   (prop + attribute) on both hosts, `selectall` on c-dropdown, `select-all` in
   `cssParts` of all three; vue-tsc passes with the `Required<…Texts>`
   defaults. Then `pnpm lint:tokens`, `pnpm lint:a11y`.
2. `cd packages/csc-ui-react && pnpm build`; `cd packages/csc-ui-documentation
   && pnpm build` (runs the example-parity check).
3. `pnpm dev` → http://localhost:3500 c-select / c-autocomplete pages, headless
   Chromium (memory: visual-verify recipe) checks:
   - Sticky: row stays at the list's top while scrolling, no 4px jump
     (autocomplete), covers rows and their indicators scrolled beneath (`z-10`).
   - Tri-state: none → empty; one pick → indeterminate; activate → all checked,
     `aria-selected="true"`; activate again → listed removed, others (with a
     query) untouched and in original order.
   - Disabled: never toggled, not counted in `texts.selectAll(count)`; a list
     with only disabled options shows no row; no row in single mode.
   - Keyboard c-select: open seeds first picked/first option, not the row;
     ArrowUp from index 0 → row; ArrowUp again closes; Home → row; Enter/Space
     toggle; ArrowDown from the row → option 0.
   - Keyboard c-autocomplete: `aria-activedescendant` = `<id>-select-all` on
     the row, `<id>-opt-N` otherwise; ArrowDown from last option → row → first;
     typing re-seeds to the first match; no matches hides the row and re-seeds;
     Enter on the row toggles and keeps focus in the search input.
   - Peek: `items-per-page="6"` shows row + 6 full option rows + half row.
   - `external`: select all on a fetched list, change the query so the picks
     disappear — tags keep labels (`committedLabels`).
   - `return-object`: emitted array holds `{ name, value }`; exactly one
     `changeValue` per activation.
   - Live region: highlighting the row announces "Select all - N of M options
     selected"; option-row position/total unchanged.
   - Dark mode and `forced-colors` emulation: fill and hairline visible.

## Risks

- Boolean attribute reset on re-render → `selectAllOn` host-attribute-first.
- `flush:'post'` watchers measure stale rows → all re-caps stay behind the rAF.
- Positioned indicators paint over the sticky row without `z-10`.
- Tag-map local alias collisions → component-prefixed names; `SelectAllState`
  never in a prop type.
- Stale `-1` after close in c-select → reset in `onDropdownStateChange`.
- `emitModelValue` re-entrancy → `toggleAll` only from click/keydown handlers.
- c-dropdown's index watcher fires on change only → `onSelectAll` calls
  `updateStatusText()` itself.
- First build after adding files may miss Tailwind utilities (memory:
  new-SFC scan miss) → grep dist for `sticky`, rebuild if absent.

## Outcome (2026-09-08)

Implemented as planned, with two deviations found in verification:

- **Autocomplete row geometry**: Chromium positions a sticky child against the
  scroll container's *content* box, so a `top-0` row inside the list's `p-1`
  rested 4px down whatever its negative margin. Instead of the `-mt-1 pt-3`
  trick, the `selectAll` tv variant now also drops the list's top inset
  (`list: 'pt-0'`, via `ui`), and the row restores the inset below itself
  (`mb-1`); it still bleeds to the full width (`-mx-1 w-auto px-[14px]`).
- **c-select Space type-ahead (pre-existing bug)**: the type-ahead regex
  admits a space, so Space in `multiple` mode both toggled the row and ran a
  type-ahead miss that nulled `currentIndex` — after which ArrowUp landed on
  the last option instead of the select-all row. Space is now excluded from
  type-ahead in `multiple` mode and opens the closed list like Enter.
- Verification: 40-check raw-CDP script (`verify-select-all.mjs` + shared
  `cdp-lib.mjs` in the session scratchpad) over a static demo; window width
  must be ≥ 761px or c-select's mobile layout (no peek cap) kicks in.
