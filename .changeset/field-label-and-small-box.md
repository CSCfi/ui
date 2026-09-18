---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Fix two field regressions from the 52px control height (ADR-0055). The resting
floating label — the one sitting inside an empty, unfocused field — now centres
in the box again instead of hanging 2px high, across `c-text-field`, `c-select`,
`c-autocomplete` and `c-tree-select`. The `small` field box is 36px again: it
had been rendering at the 52px default height, which also left its label far off
centre. The lifted label and the value text are unchanged.
