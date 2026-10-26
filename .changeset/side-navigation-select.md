---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

`c-side-navigation-item` fires `select` instead of `itemChange` when it is
activated (ADR-0075), as `c-menu` does: the detail is `{ value }`, from the
item's new `value` prop, instead of the originating DOM event. In React,
`onItemChange` becomes `onSelect`.

`c-sub-navigation-item` gains the same `value` prop and `select` event, so a
sub-item no longer needs `click` and `keyup` listeners. Both events bubble, so
one `select` listener on `c-side-navigation` can route every item. An item
nested in another item's sub-items no longer stops its event from reaching the
page.
