---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

Add `c-tree-select`, a single-value field for picking one item from nested
data of arbitrary depth (ADR-0047) — a stepped listbox in c-autocomplete's
field-plus-panel arrangement.

- The panel browses one level at a time: picking a branch lists its children,
  a breadcrumb climbs back, and the header names the level (`level-labels`)
  with a step counter while the depth is uniform.
- Typing into the in-panel search input lists matches from the whole tree
  with their path; the query matches names and codes of an item and of its
  ancestors, a `filter` predicate replaces the default, and matches are
  marked (`::part(match)`).
- `items` (a DOM property) is the tree: `{ value, name, code?, disabled?,
  children? }`. The closed field shows the committed item's path above its
  code and name; `return-object` emits `{ value, name, code, path }`.
- `allow-branch` lets a branch be committed through a pinned select-branch
  row at the top of its level list.
- Value events follow the 4.x convention: `change` (with the value),
  `update:value` and a native `input` — no `changeValue`. `change:query`
  reports the query.
- Parts: `panel`, `card`, `search`, `breadcrumb`, `crumb`, `header`, `list`,
  `item`, `select-branch`, `code`, `path`, `match`, `info`. Texts are
  overridable through `texts`; keyboard: arrows, Enter, ArrowRight /
  ArrowLeft / Backspace to move between levels, Escape.

Also in this change: the anchored-panel lifecycle and the live status region
c-autocomplete used inline are now shared internals it and c-tree-select
build on, and a click on a disabled option row in c-autocomplete no longer
moves keyboard focus out of the search input.
