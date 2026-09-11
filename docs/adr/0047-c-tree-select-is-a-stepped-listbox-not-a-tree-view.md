# 47. c-tree-select is a stepped listbox, not a tree view

Date: 2026-09-11

## Status

Accepted

Amends ADR-0009 (the anchored-panel lifecycle and the live status region it
kept inline become shared composables).

## Context

CSC forms need a field for picking one item from nested classification data
of arbitrary depth (field-of-science taxonomies with codes: three or more
levels, hundreds of leaves). Neither `c-select` nor `c-autocomplete` can
express hierarchy. The obvious shape for hierarchical data is a tree view
(`role="tree"`, expand/collapse in place); the validated prototype instead
browsed one level at a time and searched across the whole tree.

## Decision

`c-tree-select` presents the hierarchy as a **stepped listbox**: the panel
shows one level as a flat `role="listbox"`, activating a branch replaces the
list with its children, a breadcrumb climbs back, and typing switches to a
whole-tree search whose results carry their path. It reuses c-autocomplete's
field arrangement (readonly value field, in-panel search input, virtual
highlight via `aria-activedescendant` — ADR-0009) through composables
extracted from it (`useAnchoredPanel`, `useStatusAnnouncer` in
`src/shared/`). Data comes from the `items` property only. A branch is
committed (with `allow-branch`) through a pinned select-branch row inside it,
not through a second action on its own row. Value events follow ADR-0017
(`change` + `update:value` + `input`; no grandfathered `changeValue`).

## Alternatives considered

- **Tree view** (`role="tree"`, expandable rows): several levels visible at
  once, but a taxonomy hundreds of leaves wide overflows a transient panel,
  keyboard needs the full treeitem grammar, and search results still need a
  flat list — two structures in one panel.
- **Cascading columns** (several levels side by side): needs horizontal room
  a form field's panel does not have.
- **Nested `<c-option>` authoring**: both existing parents discover options
  with a descendant query and snapshot `outerHTML`; nesting would need a new
  recursive discovery helper and two render paths (data vs. snapshot). Left
  as a possible additive extension.
- **A row-level "Select" action on branches**: a nested interactive inside a
  `role="option"` is unreachable by the virtual highlight and makes Enter's
  meaning depend on `allow-branch`; the pinned row keeps every row
  single-action.

## Consequences

- One a11y model shared with c-autocomplete (editable combobox over a
  listbox); no `role="tree"` anywhere in the library.
- Committing a branch costs one extra step (descend, then the pinned row).
- Lazy loading is deferred: "leaf" means "no `children` array or an empty
  one"; a lazy marker (e.g. `childCount`) can be added without breaking the
  item shape. No `external` mode and no `change:path` event in 4.x-alpha.
- The popover-panel lifecycle and the status announcer are shared
  composables, amending ADR-0009's accepted duplication.
