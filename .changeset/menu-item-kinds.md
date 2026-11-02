---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

`c-menu-item` says what it is instead of reading a three-state `active`:
`type="radio"` makes it one choice of several, `checked` marks the current
one (a check mark and `aria-checked`), and the default `type="command"` is a
plain item that never shows a check. The `icon` prop (an SVG path) becomes
an `icon` slot, so put a `<c-icon slot="icon">` there; `active-icon` is
removed. `c-menu`'s `select` detail is typed `{ value: string | undefined }`.
