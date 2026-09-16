---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-side-navigation-title` drops its top margin when it is the first child of
`c-side-navigation`, so the first section title sits directly under the nav
padding instead of adding a section gap above it.
