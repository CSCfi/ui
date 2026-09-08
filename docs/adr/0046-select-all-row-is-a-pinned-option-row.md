---
status: accepted
---

# The select-all row is a pinned option row scoped to the listed options

`c-select` and `c-autocomplete` in `multiple` mode gain an opt-in `select-all`
row: a `role="option"` row pinned at the top of the listbox that selects — or,
when every one of them is already selected, unselects — every enabled option
currently listed, with a tri-state indicator and a `texts.selectAll(count)`
label. Amends ADR-0044, which deferred bulk selection.

## Context

ADR-0044 shipped multiple selection without a way to pick everything at once
("each extra can land later behind its own prop"). Consumers now ask for a
select-all with a customizable text. The library's one precedent is
`c-data-table`'s header checkbox and two-step banner (`selectPage`,
`selectAllItems(count)`), which selects "all (filtered) rows" and hides itself
in `external` mode. A listbox has two places for such a control: a real
checkbox in the panel header (PrimeVue MultiSelect's shape) or a row inside
the list.

## Decisions

- **A row in the listbox, not a header control.** The two fields have
  different focus models — real row focus in `c-select`, a virtual highlight
  in `c-autocomplete` where DOM focus never leaves the search input and Tab
  closes the panel — so a header checkbox would be a tab stop the panel's
  keyboard model cannot reach, and a nested interactive control of the kind
  ADR-0044 rejected. A `role="option"` row (the only valid listbox child) is
  reachable with the arrows in both fields and reuses the decorative
  indicator; it carries no value and never appears in `value`.
- **"All" is the listed enabled options, additively.** Every option in
  `c-select`; the current matches in `c-autocomplete` while a query is typed;
  the items given in `external` mode, where the full set is unknowable (the
  data table hides its banner for the same reason). Selecting appends the
  unselected listed options in list order (selection order, ADR-0044);
  unselecting removes the listed ones and keeps the rest. Disabled options
  are never touched or counted, and the row is not rendered when nothing is
  listed.
- **Tri-state with constant text.** The indicator reads none / indeterminate /
  checked; activating a checked row unselects. `aria-selected` is set only in
  the "all" state — mixing `aria-selected` and `aria-checked` in one listbox
  is discouraged — and the mixed count is spoken through the existing live
  region. The label never swaps to "Deselect all".
- **Pinned, not an item row.** The row sticks to the top of the scrolling
  list so it is reachable at any scroll offset, and it is excluded from
  `items-per-page` and the peek (ADR-0043): a cap of six shows the row, six
  option rows and the peek.
- **Never the landing highlight.** Open-seeding and query re-seeding land on
  the first enabled option, so "type, Enter" still picks one match; ArrowUp
  from the first option and Home reach the row, and the autocomplete's
  wrap-around passes through it. In `c-select`, ArrowUp on the row closes the
  list (what ArrowUp on the first option did before).
- **The label goes through `texts.selectAll(count)`** — ADR-0044's rule for
  user-visible strings — receiving the number of listed enabled options, with
  the English default "Select all"; the boolean `select-all` prop is the
  switch.

## Considered alternatives

- A `c-checkbox` in the panel header. Rejected: a second tab stop the
  panel's keyboard model cannot reach, a nested interactive control, and two
  different focus models to reconcile.
- A `select-all-text` string prop whose presence enables the row. Rejected:
  reintroduces the per-string prop ADR-0044 removed (`no-results-text`).
- "All" meaning every option regardless of the query. Rejected: it would
  select options the user cannot see, and is impossible in `external` mode.
- Swapping the label to "Deselect all" when everything is selected.
  Rejected: a second string to localise and a label that changes under the
  pointer; the indicator already carries the state.

## Consequences

- `c-dropdown` (internal) gains a `selectAllRow` prop computed by `c-select`
  and a lowercase `selectall` event; `c-dropdown`, `c-select` and
  `c-autocomplete` gain the `select-all` part.
- `c-select`'s highlight index gains a `-1` meaning "the select-all row";
  `c-autocomplete`'s virtual highlight gains a matching sentinel.
- CONTEXT.md gains **Select-all row**.
- Any future bulk action on a listed set follows this shape: a pinned
  `role="option"` row, scoped to the listed enabled options, labelled through
  `texts`.
