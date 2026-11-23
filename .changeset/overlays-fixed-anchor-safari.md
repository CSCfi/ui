---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

Menus, popovers, tooltips and the panels of the select, autocomplete, tree
select, date, time and colour pickers and the folded breadcrumb stay on their
trigger in Safari 26 (iOS included) when the trigger sits in a pinned toolbar,
a modal or another fixed or sticky container, or is designated with the
`trigger` prop. Safari 26 moved such a panel by the scroll distance as the page
scrolled, and opened it that far away after a scroll.
