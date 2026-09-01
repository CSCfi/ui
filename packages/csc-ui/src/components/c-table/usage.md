A styled wrapper for a table you author yourself: slot in a plain `<table>` and c-table gives it the CSC look plus an optional responsive card layout on narrow screens. The table stays in your own DOM — your stylesheets, your framework's rendering, and `::part()` selectors on components nested in cells (a `c-tag` status chip, a `c-pagination` footer) all keep working.

Write regular, semantic table markup: `<thead>` with `<th>` headers, `<tbody>` rows, optionally a `<tfoot>`. c-table styles it through a scoped stylesheet it installs once per page; it never takes the markup over, so rows added or removed by your framework are picked up automatically.

## Responsive mode

With `responsive`, the table collapses into stacked cards when it is narrower than `mobile-breakpoint` (pixels, default 600). Each cell then shows a label cloned from its column header so the card stays readable without the header row.

- Rows that should not receive labels (a full-width action row, a `colspan` summary) opt out with a `no-mobile-labels` attribute on the `<tr>`.
- The labels are real `<span class="c-table__mobile-label">` elements prepended into your cells, so your framework will see them. Label creation is idempotent, but if a keyed re-render replaces the cell elements, call the element's `updateMobileLabels()` method afterwards to restore them.

## Styling

Cell content is yours to style: page CSS reaches everything inside the table, including `::part()` on nested components. The table's own defaults are applied at `c-table > table.c-table …` specificity — to override one of them (say, cell padding), match that scope: `c-table table.c-table td { padding: 8px; }`.
