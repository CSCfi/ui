---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Fix(c-autocomplete): a component nested in a slotted option — a `c-icon` with
a bound `path`, for instance — renders in the panel as soon as it opens, not
only after a query is typed. Changing an option's `disabled`, `value` or the
attributes of its content after mount now updates its row as well.
