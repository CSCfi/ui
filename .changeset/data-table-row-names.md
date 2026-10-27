---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

`c-data-table` accessibility fixes:

- A row's checkbox and expander are named after the row ("Select Aurora",
  "Details of Aurora", from its value in the first visible column) instead of
  one "Select row" and "Toggle row expansion" for every row. `texts.selectRow`
  and `texts.expandRow` also take a function of that value; a string still
  names every row alike.
- The select-all banner's message is announced, the first one included.
- The table is `aria-busy` while `loading`.
