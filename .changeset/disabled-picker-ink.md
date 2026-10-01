---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Fix disabled rows in c-time-picker and disabled days in c-date-picker looking
almost like enabled ones in light mode. They now use a new
`on-surface-disabled` token.
