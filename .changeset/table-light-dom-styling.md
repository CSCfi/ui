---
"@cscfi/csc-ui": minor
"@cscfi/csc-ui-react": minor
---

c-table now leaves your `<table>` in your own DOM instead of moving it into
its shadow root:

- Your page CSS and `::part()` selectors now reach everything inside the
  table — e.g. a `c-tag` in a cell can be styled with
  `c-tag.status::part(root) { … }`, matching how other components customize.
- c-table installs its table styling once per page as a scoped stylesheet
  (`c-table > table.c-table …`). Note that your own global table resets can
  now also reach the table, which the shadow boundary previously blocked.
- Responsive mobile labels are cloned from the header cells as live nodes
  instead of serialized HTML, and header lookup now only considers
  `<th>` elements inside `<thead>`.
- A `<table>` slotted in after mount is now picked up automatically.
