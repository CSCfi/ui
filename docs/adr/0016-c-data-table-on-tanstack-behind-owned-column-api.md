# c-data-table builds on TanStack Table behind a component-owned column API

The new `c-data-table` (csc-ui-next) is implemented on `@tanstack/vue-table`
rather than hand-rolling table state. The old Stencil `c-data-table` was
~1,400 lines of interwoven sorting/selection/expansion/pagination logic; the
new feature list (column pinning/visibility, row expansion, selection,
sorting, pagination, external/manual data modes) maps almost 1:1 onto
TanStack's headless core, and headless means all rendering and styling stay
ours (Tailwind variants, parts, semantic tokens — nothing visual is imposed).
This is the library's first non-trivial runtime dependency beyond Vue
(~15 kB min+gz, tree-shakeable); we accept that cost once, for one component,
instead of re-learning the old implementation's bugs.

TanStack does **not** leak into the public API:

- Rows are the consumer's **plain domain objects** (`data: T[]`). The old
  per-cell object shape (`{ value, formattedValue, component, children }`)
  that intertwined data with presentation is gone — presentation lives
  entirely in column definitions.
- Columns are described by a **component-owned type** (`CDataTableColumn`,
  per ADR-0015), mapped to TanStack `ColumnDef` internally. The manifest and
  IDE artifacts (ADR-0012/0015) can therefore document the full column
  contract; TanStack remains a swappable implementation detail, and its major
  versions don't become our breaking changes.
- Custom cell content is a **render function** on the column
  (`cell?: (ctx) => VNode | string | number`, likewise `footer` and expanded
  row content), since scoped slots cannot cross the custom-element boundary.
  The package re-exports Vue's `h` so consumers author cells without a direct
  `vue` import; strings render as text (no innerHTML path).

## Considered options

- **Hand-rolled state (like Stencil)** — zero deps, but a large, bug-prone
  maintenance surface for logic TanStack already solves. Rejected.
- **`@tanstack/table-core` + own reactivity glue** — marginally smaller, but
  we'd own the shallowRef/trigger integration the Vue adapter already gets
  right. Rejected.
- **Exposing `ColumnDef` directly (+ `ColumnMeta` augmentation)** — full
  TanStack power with no plumbing, but pins the public API to TanStack
  majors, defers docs to TanStack's docs, and cannot be described by the
  CEM manifest. Rejected.
- **Declarative cell descriptors (old `{ tag, params, injectValue }`)** —
  serializable and framework-neutral, but composing conditional content or
  listeners is exactly the pain the rewrite escapes. Rejected as the primary
  mechanism.

## Consequences

- Every TanStack feature we want must be explicitly plumbed through
  `CDataTableColumn` / props; nothing is available "for free" until mapped.
- Column definitions contain functions, so they must be passed as DOM
  **properties**, never attributes (already true of `data`).
- `h()` becomes consumer-facing vocabulary for rich cells, including for
  React/vanilla consumers (it's still just a function call for them).
