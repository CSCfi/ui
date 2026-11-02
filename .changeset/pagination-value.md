---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

`c-pagination`'s value is `{ itemCount, page, pageSize, … }`, matching
`c-data-table`: `currentPage` is `page` and `itemsPerPage` is `pageSize`. The
pagination no longer writes into your object; each pick emits a new value with
`startFrom` and `endTo`, and nothing is emitted at mount or when you set
`value`.

`textOverrides` is replaced by a `texts` prop (`CPaginationTexts`), which works
as an app default too: `pageSize`, `previousPage`, `nextPage`,
`range(start, end, count)`, `page(page, pageCount)` and `pagination`, the
landmark's name. `c-data-table`'s `texts` takes the same keys for its
pagination.

The page-size menu's `select` no longer reaches the page.

The ellipsis between runs of page buttons is hidden from assistive
technology: it was a focusable separator.
