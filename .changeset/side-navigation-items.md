---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-side-navigation` fixes:

- Sub-items added after the navigation mounts go under their item, which
  becomes an expandable parent.
- A `c-navigation-button` no longer toggles a desktop (non-`mobile`)
  navigation or fires `change:open` from it.
- Enter on an item with an `href` fires `select` once, not twice, and a nested
  item with an `href` follows its link.
