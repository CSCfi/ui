---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-side-navigation`: activating an item or sub-item no longer sets its
`active`. Mark the current page's item `active` from your router or the URL:
a navigation the router cancels no longer leaves the clicked item highlighted.
A parent still expands and collapses itself.
