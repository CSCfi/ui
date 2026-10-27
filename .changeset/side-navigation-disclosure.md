---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-side-navigation` follows the WAI-ARIA disclosure navigation pattern:

- It is a `<nav>` landmark (named by an `aria-label` on the element) instead of
  a `menubar` with no arrow-key support. Items and sub-items are links when
  they have an `href` and buttons when not; a parent is a disclosure button
  that controls its sub-items. A sub-item with an `href` is a real link (it
  used to navigate by script).
- `c-side-navigation-title` is a heading (level 2).
- The open mobile drawer is a modal dialog: focus moves into it, the page
  behind it is inert and stops scrolling, Escape closes it, and closing
  returns focus to the navigation button.
- `c-navigation-button` reports the mobile drawer as expanded or collapsed.
