---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

A plain `c-tag` (neither `closeable` nor `flat`) works as a toggle button from
the keyboard: Enter and Space fire `click` as a mouse click does, and `active`
is announced as its pressed state (`aria-pressed`).
