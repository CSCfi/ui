# c-data-table (csc-ui-next) — resolved design

Outcome of the grilling session on the original plan in
`_todo/csc-ui-next-data-table.md`. Foundation decisions are recorded in
**ADR-0016** (`docs/adr/0016-c-data-table-on-tanstack-behind-owned-column-api.md`);
vocabulary in **CONTEXT.md → Data table**. This file is the implementation
spec.

## Foundation (ADR-0016)

- Built on **`@tanstack/vue-table`** (new runtime dependency, ~15 kB).
- TanStack does **not** leak into the public API: rows are plain domain
  objects (`data: T[]`), columns are a component-owned **`CDataTableColumn`**
  type mapped to `ColumnDef` internally.
- Rich cells via **render functions** (`cell`, `footer`, expanded content);
  the package **re-exports Vue's `h`**. Strings render as text — no innerHTML
  path. Column defs contain functions ⇒ always passed as DOM properties.
- Visual parity with the old Stencil `c-data-table`.

## CDataTableColumn (shape sketch)

| Field | Type | Notes |
|---|---|---|
| `key` | `string` | accessor into the row object |
| `header` | `string \| () => VNode` | rendered top cell |
| `cell` | `(ctx) => VNode \| string \| number` | optional custom renderer |
| `footer` | same as `cell` | `<tfoot>` renders iff ≥1 column defines one |
| `sortable` | `boolean` | |
| `pinned` | `'left' \| 'right'` | **sticky during horizontal scroll** (TanStack sense, NOT the old meaning); implies never autohidden; rejected with a dev warning if combined with `expansion: 'always'` |
| `expansion` | `'auto' \| 'never' \| 'always'` | **expansion policy** tri-state, default `'auto'`. `'always'` replaces old `hidden`; `'never'` replaces old `pinned` (autohide-exemption). Invalid combos unrepresentable |
| `align` / `width` | as old | carried over |

## Props

| Prop | Type | Notes |
|---|---|---|
| `data` | `T[]` | plain row objects |
| `columns` | `CDataTableColumn[]` | not `headers` |
| `getRowId` | `(row) => string` | index fallback; required in practice for selection/expansion with external data |
| `selection` | `'single' \| 'multiple'` | unset = not selectable (replaces `selectable`+`singleSelection`) |
| `selected` | `string[]` | controllable; row ids |
| `expanded` | `string[]` | controllable |
| `singleExpansion` | `boolean` | kept from old API |
| `sort` | `{ column: string; direction: 'asc' \| 'desc' } \| null` | controllable, atomic; click toggles asc↔desc, new column starts asc (old behavior); multi-sort out of scope |
| `filter` | `string` | TanStack global filter, client-side only; ignored (documented) in external mode |
| `page` / `pageSize` | `number` | controllable; **pagination active iff `pageSize` set** — unset renders all rows, no footer pager. pageSize change resets page to 1 |
| `pageSizes` | `number[]` | page-size menu options |
| `itemCount` | `number` | total rows, external mode only |
| `external` | `boolean` | single flag (like old `external-data`): table renders `data` verbatim; sorting/pagination/filtering become consumer-driven via update events |
| `autohide` | `boolean` | overflow strategy: on = move `'auto'` columns to expansion row, rightmost first; off (default) = horizontal scroll |
| `stickyHeader` / `stickyFooter` | `boolean` | off by default |
| `loading` | `boolean` | overlay + `texts.loading` |
| `texts` | `CDataTableTexts` | flat keys; strings for static labels, `(n) => string` fns for interpolated ones; shallow-merged over English defaults; covers table + footer + select-all banner + a11y labels |
| `expandedContent` | `(ctx) => VNode` | table-level custom expansion renderer |

## Events (custom-element `:prop` in + `@change:*` out — no v-model args)

> **As-built deviation:** originally spec'd as `update:*` names. Vue's runtime
> silently drops any `onUpdate:*` listener on native/custom elements
> (`isModelListener` in `patchProp`), so `@update:page` etc. never attach in a
> Vue consumer. Renamed to `change:*` all-lowercase kebab (ADR-0017), which
> also works in no-build in-DOM templates.

- `change:selected` — detail `{ ids: string[], rows: T[] }` (rows resolved
  for ids present in current data; id-based state survives paging)
- `change:expanded`, `change:sort`, `change:page`, `change:page-size`

## Selection semantics

- Header checkbox is **page-scoped** (all/partial/none of the visible page).
- **Two-step "select all" banner (Gmail-style) is client-side only**: with
  internal data "select all N" enumerates every id, so `selected: string[]`
  stays the single state shape. With `external`, the banner does not render —
  symbolic "all matching" selection is the consumer's UI. (Rejected:
  `{ all: true, excludedIds }` state shapes.)

## Expansion semantics

- Expansion row content = auto-rendered label/value cells of columns
  currently in the expansion row (policy `'always'` + autohidden `'auto'`
  columns, using each column's header + cell renderer), **then** the
  consumer's `expandedContent` output appended. No opt-out flag.
- Expander chevron column auto-added whenever any expansion source exists.
- Utility columns are always pinned: selection left, expander right
  (as-built deviation from the original "both left" wording — the expander
  renders at the right table edge, so pinning it left was incoherent; the
  intent, never scrolling out of view, is preserved).
- During horizontal scroll, expansion-row content is sticky at the width of
  the visible table area.

## Slots

- `empty` — empty state; fallback: `texts.noData`
- `caption` — rendered into a real `<caption>`

(Both are scope-free, so real slots work across the custom-element boundary.)

## Internals / structure

- Tag `c-data-table`, standalone component; internal pieces (header
  checkbox, banner, footer pagination) are internal-only elements, not
  composed children.
- Reuses `c-checkbox`, `c-pagination` (fed a `CPaginationOptions` object
  internally — its fields never leak into the table API), `c-loader`/`c-spinner`.
