---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

`texts` keys renamed after what they name:

- `c-number-field`: `increase` / `decrease` → `stepUp` / `stepDown`, as its
  `step-up` / `step-down` parts.
- `c-tree-select`: `select` → `selectBranch` (the select-branch row) and
  `step` → `levelCounter`.
- `c-file-upload`: `waiting` → `queued` (the row's status) and `dismiss` →
  `close` (a rejected row's close button), whose default now reads
  "Close …".
