---
"@cscfi/csc-ui": patch
"@cscfi/csc-ui-react": patch
---

`c-pagination`'s page buttons are named by `texts.page` ("page 2 of 4"); the
name sat on an inner element that assistive technology ignores, so they were
read as bare numbers. The page-size button's name includes the current size
("Items per page: 25").
