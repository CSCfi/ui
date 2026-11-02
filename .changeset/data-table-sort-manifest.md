---
"@cscfi/csc-ui": major
"@cscfi/csc-ui-react": major
---

`c-data-table` announces a sort (`aria-sort`, and the sorted column's tint)
only on a `sortable` column: a `sort` naming another column sorts nothing, but
was announced as sorted. `change:sort` is typed `CDataTableSort`, as it never
carries `null`.

The manifest, and the editor data built from it, no longer list a `sort`
attribute on `c-data-table` (it takes an object; set the `sort` property), and
list the `value` attributes of `c-date-picker`, `c-time-picker` and
`c-tree-select` as the string (or number) they take.
