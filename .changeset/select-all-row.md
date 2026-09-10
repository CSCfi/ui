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

In a `multiple` c-select, Space now only toggles the focused row (and opens
the closed list, like Enter); it no longer also feeds the type-ahead, which
silently dropped the tracked highlight after every Space toggle.
