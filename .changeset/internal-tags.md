---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

`c-input` and `c-dropdown` are no longer public API (ADR-0075). They are the
pieces the form fields and `c-select` build themselves from, and consumers never
author them. They still register, but they are left out of
`custom-elements.json`, the IDE data and the element types (`CInputElement`,
`CDropdownElement`), and `@cscfi/csc-ui-react` no longer exports `CInput`. The
manifest names them in `csc.internalTags`.
