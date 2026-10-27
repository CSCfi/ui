---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-accordion` sets up items added after it mounts: an item the `value` names
opens, and `outlined` reaches it. In a `multiple` accordion a single `value`
counts as the first expanded item instead of being dropped at the first toggle.
