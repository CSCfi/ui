A data-driven table that renders the rows of a `data` array through a set of `columns` definitions, with built-in sorting, pagination, row selection and expandable rows. Rows are your own plain objects; each column reads one of their properties and may render its header, cells and footer through render functions.

`columns` and `data` hold arrays and functions, which have no attribute form: bind them as DOM properties — `:columns` and `:data` in Vue, props of the React wrapper, property assignment in plain JavaScript. The same goes for `sort`, `selected`, `expanded`, `texts`, `pageSizes`, `getRowId` and `expandedContent`, while scalars such as `page-size`, `selection` and `autohide` also work as attributes. A plain Vue binding already sets the property; do not add the `.prop` modifier.

```vue
<c-data-table :columns="columns" :data="projects" page-size="25" />
```

Sorting, the page, the page size, the selection and the expanded rows are optionally controlled: the table keeps each in its own state, so a user action takes effect and fires its `change:*` event whether or not you bind the matching prop, and a value you set replaces the table's state.

## When to use

- Tabular data held as an array of objects, especially when users sort, page, select or expand rows: the table does that work for you, or hands it to your server with `external`.
- For a table whose markup you write yourself — rows rendered by your framework, cells styled by your page CSS, a card layout on narrow screens — use `c-table`, which wraps your own `<table>`. Pair it with `c-pagination` when it needs paging.

## Columns

Each entry of `columns` is a `CDataTableColumn`:

- `key` (required) — the row property the column reads. It is also the column's id, so it must be unique.
- `header` — the header text, or a render function for richer content. Defaults to the `key`.
- `cell` — a render function for the column's cells. Without one a cell shows the value as text, `null` and `undefined` as empty.
- `footer` — a render function for the column's footer cell (see Caption, footer and sticky rows).
- `align` — `start`, `center` or `end`, for the header, cells and footer alike. Unset is `start`.
- `width` — a fixed width, any CSS width value.
- `sortable` — lets the user sort by the column.
- `pinned` and `expansion` — see Narrow containers.

Render functions return Vue VNodes, in React and plain JavaScript too: build them with the `h` re-exported by `@cscfi/csc-ui` (no `vue` dependency needed), or return a string or number, which renders as text, never as HTML. A `cell` function receives `{ column, row, rowId, rowIndex, value }`:

```ts
import { h, type CDataTableColumn } from '@cscfi/csc-ui';

const columns: CDataTableColumn[] = [
  { header: 'Project', key: 'name', sortable: true },
  {
    cell: ({ value }) =>
      h('c-tag', { active: value === 'active' }, String(value)),
    header: 'Status',
    key: 'status',
  },
  {
    align: 'end',
    cell: ({ row }) =>
      h(
        'c-button',
        { onClick: () => open(row), size: 'small', text: true },
        'Open',
      ),
    header: 'Actions',
    key: 'actions',
  },
];
```

Cell content renders inside the table's shadow root, so page stylesheets, and `::part()` rules for components nested in cells, do not reach it. Style it in the render function: through a component's own props or an inline `style`.

Sorting and the `query` filter read the raw `row[key]` value, never what a `cell` function renders.

## Row ids

Selection and expansion track rows by id. Supply `getRowId`, a function returning a unique string for a row (`(row) => String(row.id)`); without it a row's id is its index in `data`. The table's own sorting, paging and filtering keep index ids stable, but they point at other rows once your code replaces, reorders or filters `data`, and with `external` paging every page starts again at `0`. Set `getRowId` whenever selection or expansion meets data that changes.

## Sorting

Mark a column `sortable: true` to make its header a sort button; other columns never sort. The first click on a header sorts its column ascending, each further click flips the direction, and clicking another sortable header starts that column ascending. A click never returns the table to unsorted: set `sort` to `null` for that. By default nothing is sorted and rows keep their order in `data`.

`sort` holds the state as `{ column, direction }`: the sorted column's `key`, and `asc` or `desc`. Each user sort fires `change:sort` with the new state:

```vue
<c-data-table
  :columns="columns"
  :data="projects"
  :sort="sort"
  @change:sort="sort = $event.detail"
/>
```

Client-side, the table sorts all rows, then pages them; with `external` it only reports the new state.

## Filtering

`query` narrows the rows client-side: a row stays when any column's value contains the query, ignoring case. Only columns holding strings or numbers are searched (judged by the first row), and the match runs on the raw value. A new query returns the table to page 1. With `external`, `query` is ignored: filter on your side and pass the result as `data`.

## Pagination

The table paginates only while `page-size` is set; without it every row renders and there is no pager. With it, a `c-pagination` bar below the table shows the page buttons, the range of rows shown and a page-size menu offering `pageSizes` (default `[5, 25, 50, 100]`). `page` is the current page, counting from 1.

The user's picks fire `change:page` with the new page and `change:page-size` with the new size. A new size also returns to the first page, firing `change:page` with `1` when the table was on a later page. The table moves the page itself as well, again firing `change:page`: back to 1 when `query` changes, and to the last page when the rows shrink beneath the current one.

## External data

Set `external` when your code, typically a server, sorts, pages and filters the rows. The table then renders `data` verbatim, so pass only the current page's rows, and its `change:sort`, `change:page` and `change:page-size` events become your signal to fetch. Set `item-count` to the total number of rows so the pager knows how many pages there are (without it the pager counts `data`), and `loading` while a request is in flight. On `change:page-size`, fetch the first page at the new size. See the external data example.

With `external`, `query` is ignored and the select-all banner never shows: the table cannot know the ids of rows it has not been given.

## Selection

`selection="multiple"` adds a checkbox column: a row's checkbox toggles that row, and the header checkbox selects or clears every row on the current page, reading as partly checked when only some are selected. `selection="single"` gives each row a checkbox that replaces the selection, and no header checkbox. Clicking a row does not select it.

`selected` holds the selected row ids, and each user change fires `change:selected` with the new array. Ids stay selected while their rows are sorted, paged or filtered out of view. The read-only `selectedRows` property returns the row objects behind the ids, in selection order — only those the current `data` holds, so with `external` paging it lists the current page's selected rows while `selected` keeps the ids from every page.

```vue
<c-data-table
  :columns="columns"
  :data="datasets"
  :get-row-id="getRowId"
  :selected="selected"
  selection="multiple"
  @change:selected="selected = $event.detail"
/>
```

With client-side data and pagination, selecting a whole page in `multiple` mode shows a banner above the table: "All 25 rows on this page are selected", with a button that selects every row matching `query`. Once every row is selected, the banner offers to clear the selection instead.

## Expandable rows

A row becomes expandable as soon as there is something to show beneath it: a column whose cells live in the expansion row (see Narrow containers), or an `expandedContent` render function. An expander column then appears at the table's right edge. Its button, or a click anywhere on the row other than on a link, button, form control or menu, opens the row's expansion row: the cells of the columns living there, each under its header, followed by `expandedContent`, which receives `{ expansionColumns, row, rowId, rowIndex }`.

`expanded` holds the expanded row ids, and toggling a row fires `change:expanded` with the new array. `single-expansion` keeps at most one row open, closing the previous one as another opens. Should the table grow until no column is left in the expansion row and there is no `expandedContent`, the expander column goes away and every row closes, firing `change:expanded` with `[]`.

## Narrow containers

A column's expansion policy decides where its cells live: `expansion: 'auto'` (the default) keeps it a real column unless autohide moves it, `'never'` always keeps it a column, and `'always'` never renders it as a column — its cells appear only in the expansion row, for detail that does not need a column of its own.

When the columns are wider than the container, the table scrolls sideways inside `::part(viewport)` by default. With `autohide` it instead moves `auto` columns into the expansion row, rightmost first, until the rest fit, and brings them back as the container grows. If the table still overflows once every `auto` column is hidden, it scrolls.

Pin a column with `pinned: 'left'` or `pinned: 'right'` to keep it at that edge while the table scrolls sideways. Pinned columns move to their edge, in the order you list them, and are never autohidden. The selection column is always pinned at the left edge and the expander column at the right. A pinned column cannot also have `expansion: 'always'`: the pin is ignored, with a console warning.

## Caption, footer and sticky rows

The `caption` slot fills the table's native `<caption>`, which is also its accessible name.

A column's `footer` render function adds a footer row, rendered once any column defines one. It receives `{ column, rows }`, where `rows` are the rows on the current page — for page totals:

```ts
footer: ({ rows }) => `${rows.reduce((sum, row) => sum + (row.size as number), 0)} GB`,
```

`sticky-header` and `sticky-footer` keep the header and footer rows in view while the table scrolls vertically. The table scrolls inside `::part(viewport)`, which grows with its rows, so cap the viewport's height for the rows to scroll there:

```css
c-data-table::part(viewport) {
  max-height: 480px;
}
```

## Loading and empty states

`loading` runs a thin progress bar under the header row; rows already shown stay in place. A table with no rows shows "No data", or "Loading data" while `loading` is set. The `empty` slot replaces both texts with your own content — switch that content yourself if it should differ while loading.

## Texts

The built-in strings are translated through `texts`, merged key by key over the English defaults: `noData`, `loading` and `selectPage`; `selectRow` and `expandRow`, functions receiving the row's value in the first visible column (or one string for every row); the banner's `pageSelected`, `allSelected` and `selectAllRows`, functions receiving a row count, and `clearSelection`; and the pager's `pagination`, `pageSize`, `previousPage`, `nextPage`, `page` and `range`, which the table hands to its `c-pagination` (see the `c-pagination` texts). Since some keys are functions, bind the object as a DOM property:

```vue
<c-data-table
  :columns="columns"
  :data="projects"
  :texts="{
    noData: 'Ei tietoja',
    pageSelected: (count) => `Kaikki tämän sivun ${count} riviä on valittu`,
  }"
/>
```

To translate every data table at once, set `texts` app-wide with `applyDefaults({ 'c-data-table': { texts } })` (Customization → App-wide prop defaults); a per-instance `texts` still wins key by key. Pager keys the table's texts leave unset fall through to `c-pagination`'s own, so an app-wide `c-pagination` translation covers the table's pager too.

## Accessibility

- The table is a native `<table>` with column headers, so screen readers' table navigation works. Name it through the `caption` slot: an `aria-label` on the element does not reach the table. To keep the caption for screen readers only, hide it visually through `::part(caption)`.
- Sortable headers are buttons in the tab order, operated with Enter or Space; the sorted column's header carries `aria-sort`.
- The checkboxes and expander buttons are named by `texts.selectRow`, `texts.selectPage` and `texts.expandRow`; a row's checkbox and expander carry the row's first-column value ("Select Aurora", "Details of Aurora"), so each is told apart. The expander reports its state with `aria-expanded`. Clicking a row to expand it is a pointer shortcut; keyboard users reach the expander button.
- The select-all banner's message is announced through a polite status region.
- While `loading` the table is `aria-busy`; the loading bar itself is decorative.
- Give every column a header — an empty `header` leaves its cells without one in screen-reader table navigation — and give icon-only controls you render in cells an `aria-label`.

## Customization

Restyle through the parts: `::part(root)` (the wrapper), `::part(viewport)` (the scroll container), `::part(table)`, `::part(caption)`, `::part(header)` and `::part(header-cell)` (the `<thead>` and a data column's `<th>`), `::part(body)`, `::part(row)` and `::part(cell)` (the `<tbody>`, a data row and a data column's `<td>`), `::part(expansion-row)`, `::part(footer)` (the `<tfoot>`), `::part(empty)` (the empty-state content), `::part(banner)` (the select-all banner) and `::part(pagination)` (the bar holding the pager). The selection and expander cells carry no part, and the pager's own parts are not forwarded. Colours come from the semantic tokens; override the tokens to re-theme.
