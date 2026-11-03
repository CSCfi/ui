---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

`c-side-navigation-item` splits `active` into what it meant on each kind of
item: `current` marks the item of the page you are on
(`aria-current="page"`), and `expanded` shows a parent item's sub-items.
`c-sub-navigation-item` takes `current` too. `active` is deprecated and keeps
working until 5.0; the new ones win when set. Bind `current` from your
router's current route; the side navigation writes `expanded` itself as
parents open and close.
