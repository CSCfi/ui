A page navigation bar for a list split into pages: previous and next buttons around a window of page buttons, with a page-size menu and the range of items shown.

Its `value` is one object holding the item count, the current page and the page size. Bind it with `v-model`, or set it and listen for `change`. Objects have no attribute form, so `value` is a DOM property: `v-model` or `:value` in Vue, the React wrapper's `value`, property assignment in plain JavaScript.

```vue
<c-pagination v-model="pagination" />
```

## When to use

- Paging through a list or a table you render yourself — a `c-table`, a list of cards — that would be too long to show at once.
- Not with `c-data-table`: it renders its own pagination once its `page-size` is set.

## Value

`value` is a `CPaginationOptions` object:

- `itemCount` (required) — the number of items to page through. The buttons, previous and next included, appear only while it is above 0.
- `page` — the current page, counting from 1. Default 1.
- `pageSize` — items per page. Default 25.
- `pageSizes` — the sizes the page-size menu offers. Default `[5, 25, 50, 100]`.
- `totalVisible` — the most page buttons shown at once, ellipses included. Default 7. With more pages than that, the first and last page stay in view and an ellipsis stands for the pages left out.

Each pick — a page button, previous, next, a page size — emits a new object: your fields, the picked `page` and `pageSize`, and `startFrom` and `endTo`, the 0-based indices of the page's first and last item. A new page size returns to page 1. `startFrom` and `endTo` are set only on emitted values; on a short last page `endTo` is the last item, so `items.slice(startFrom, endTo + 1)` gives the page's items.

The pagination never writes into your object, and setting `value` emits nothing: it only moves the controls to the new value. A new object does that even when its fields are unchanged, so write the emitted value back (as `v-model` does) or keep the object stable between renders. An object literal re-created on every React render resets the page each time.

## Events

`c-pagination` is a value control: each pick fires `change` with the new value, along with `update:value` carrying the same value and a bubbling `input`. In Vue, `v-model` rides these; in React, `onChange` receives the value as `event.detail`.

## Layout

- `hide-details` hides the page-size menu and the range text, leaving the buttons.
- `hide-range` hides only the range text.
- `simple` drops the page buttons and moves previous and next to the bar's end; the range text is then the only sign of position. With `hide-details simple`, previous and next are all that remain.
- `size="small"` renders compact buttons.

While both fit, the page-size menu and the range text share a row, the range at its right edge; in a narrow container the range moves under the menu.

## Texts

Every built-in string can be replaced through `texts`, merged key by key over the English defaults: `pagination` (the landmark's name, "Pagination"), `pageSize` (the menu's label, "Items per page:"), `previousPage` and `nextPage` (the arrow buttons' names), `page` (a page button's name, from the page and the page count: "page 3 of 10") and `range` (the range text, from the first and last item, counting from 1, and the item count: "11 - 20 of 96 items"). Some keys are functions, so bind the object as a DOM property:

```vue
<c-pagination
  v-model="pagination"
  :texts="{
    nextPage: 'Seuraava sivu',
    page: (page, pageCount) => `sivu ${page} / ${pageCount}`,
    pageSize: 'Kohteita sivulla:',
    pagination: 'Sivutus',
    previousPage: 'Edellinen sivu',
    range: (start, end, count) => `${start}–${end} / ${count}`,
  }"
/>
```

To translate every pagination at once, set `texts` app-wide with `applyDefaults({ 'c-pagination': { texts } })` (Customization → App-wide prop defaults); a per-instance `texts` still wins key by key. The app-wide texts also reach the pager inside `c-data-table`, except for keys the table's own `texts` set.

## Accessibility

- The bar is a `<nav>` landmark named by `texts.pagination`. With several on a page, give each its own name.
- The current page's button carries `aria-current="page"`. Page buttons are named by `texts.page`, the arrows by `texts.previousPage` and `texts.nextPage`, and the arrows are disabled on the first and last page. The ellipses are hidden from assistive technology and out of the tab order.
- A page change is not announced. When the paged content updates elsewhere on the page, move focus to it, or announce the change, where the user needs to follow it.

## Customization

Restyle through the parts: `::part(root)` (the `<nav>`), `::part(details)` (the page-size menu and the range text), `::part(items-per-page)` (the menu's label and button) and `::part(pages)` (the list of arrow and page buttons). The buttons are `c-icon-button`s whose own parts are not forwarded. Colours come from the semantic tokens; override the tokens to re-theme.
