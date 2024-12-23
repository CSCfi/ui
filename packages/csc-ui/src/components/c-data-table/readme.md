# c-datatable



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute              | Description                                               | Type                                                                                                                                                                                                              | Default                                                                                       |
| --------------------- | ---------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `data`                | --                     | Data of the table                                         | `CDataTableData[]`                                                                                                                                                                                                | `[]`                                                                                          |
| `externalData`        | `external-data`        | Externally sorted and paginated data                      | `boolean`                                                                                                                                                                                                         | `false`                                                                                       |
| `footerOptions`       | --                     | Items per page options                                    | `{ hideDetails?: boolean; simple?: boolean; hideRange?: boolean; size?: "small" \| "default"; }`                                                                                                                  | `{     hideDetails: false,     simple: false,     hideRange: false,     size: 'default',   }` |
| `headers`             | --                     | Headers of the table                                      | `CDataTableHeader[]`                                                                                                                                                                                              | `[]`                                                                                          |
| `hideFooter`          | `hide-footer`          | Hide the footer                                           | `boolean`                                                                                                                                                                                                         | `false`                                                                                       |
| `horizontalScrolling` | `horizontal-scrolling` | Use horizontal scrolling                                  | `boolean`                                                                                                                                                                                                         | `false`                                                                                       |
| `loading`             | `loading`              | Show a loader on top of the table                         | `boolean`                                                                                                                                                                                                         | `false`                                                                                       |
| `loadingText`         | `loading-text`         | Text shown when there is no data and the table is loading | `string`                                                                                                                                                                                                          | `'Loading data'`                                                                              |
| `noDataText`          | `no-data-text`         | Text shown when there are no data available               | `string`                                                                                                                                                                                                          | `'No data'`                                                                                   |
| `pagination`          | --                     | Pagination options                                        | `{ itemCount: number; currentPage?: number; totalVisible?: number; itemsPerPage?: number; startFrom?: number; endTo?: number; locale?: string; textOverrides?: CPaginationTextOverrides; pageSizes?: number[]; }` | `undefined`                                                                                   |
| `selectable`          | `selectable`           | Make rows selectable                                      | `boolean`                                                                                                                                                                                                         | `false`                                                                                       |
| `selectionProperty`   | `selection-property`   | Property used in selections                               | `string`                                                                                                                                                                                                          | `null`                                                                                        |
| `singleExpansion`     | `single-expansion`     | Allow only a single row expanded at a time                | `boolean`                                                                                                                                                                                                         | `false`                                                                                       |
| `singleSelection`     | `single-selection`     | Select only a single row at a time                        | `boolean`                                                                                                                                                                                                         | `false`                                                                                       |
| `sortBy`              | `sort-by`              | Sort data by                                              | `any`                                                                                                                                                                                                             | `null`                                                                                        |
| `sortDirection`       | `sort-direction`       | Sorting direction                                         | `"asc" \| "desc"`                                                                                                                                                                                                 | `null`                                                                                        |
| `stickyHeader`        | `sticky-header`        | Use sticky header                                         | `boolean`                                                                                                                                                                                                         | `false`                                                                                       |


## Events

| Event       | Description                | Type                                                                                                                                                                                                                           |
| ----------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `expand`    | Triggered on row expansion | `CustomEvent<any>`                                                                                                                                                                                                             |
| `paginate`  | Triggered on pagination    | `CustomEvent<{ itemCount: number; currentPage?: number; totalVisible?: number; itemsPerPage?: number; startFrom?: number; endTo?: number; locale?: string; textOverrides?: CPaginationTextOverrides; pageSizes?: number[]; }>` |
| `selection` | Triggered on selection     | `CustomEvent<any>`                                                                                                                                                                                                             |
| `sort`      | Triggered on sort          | `CustomEvent<any>`                                                                                                                                                                                                             |


## Methods

### `clearSelections() => Promise<void>`

Clear selections externally

#### Returns

Type: `Promise<void>`



### `getData() => Promise<Record<string, string | number | boolean>[]>`

Provide sorted data

#### Returns

Type: `Promise<Record<string, string | number | boolean>[]>`




## CSS Custom Properties

| Name                                                             | Description                                                                   |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `--c-data-table-active`                                          | Table active color (used in variety of places)                                |
| `--c-data-table-background-color`                                | Table background color                                                        |
| `--c-data-table-background-color-hover`                          | Table background color (affects row color, header cell background color etc.) |
| `--c-data-table-border-color`                                    | Table border color                                                            |
| `--c-data-table-checkbox-background-color-hover`                 | Table checkbox hover background color                                         |
| `--c-data-table-checkbox-color`                                  | Table checkbox color                                                          |
| `--c-data-table-checkbox-color-active`                           | Active table checkbox color                                                   |
| `--c-data-table-highlighted-column-background-color`             | Table highlighted column background color                                     |
| `--c-data-table-menu-background-color-hover`                     | Table pagination menu hover background color                                  |
| `--c-data-table-menu-outline-color`                              | Table pagination menu outline color                                           |
| `--c-data-table-menu-text-color`                                 | Table pagination menu text color                                              |
| `--c-data-table-menu-text-color-active`                          | Active table pagination menu text color                                       |
| `--c-data-table-pagination-button-active-background-color`       | Table pagination button background color                                      |
| `--c-data-table-pagination-button-active-background-color-hover` | Table pagination button hover background color                                |
| `--c-data-table-pagination-button-active-text-color`             | Active table pagination button text color                                     |
| `--c-data-table-pagination-button-background-color`              | Table pagination button background color                                      |
| `--c-data-table-pagination-button-background-color-hover`        | Table pagination button hover background color                                |
| `--c-data-table-pagination-button-text-color`                    | Table pagination button text color                                            |
| `--c-data-table-selected-row-background-color`                   | Table selected row background color                                           |


## Dependencies

### Depends on

- [c-checkbox](../c-checkbox)
- [c-pagination](../c-pagination)
- [c-icon-button](../c-icon-button)
- [c-icon](../c-icon)
- [c-spacer](../c-spacer)

### Graph
```mermaid
graph TD;
  c-data-table --> c-checkbox
  c-data-table --> c-pagination
  c-data-table --> c-icon-button
  c-data-table --> c-icon
  c-data-table --> c-spacer
  c-checkbox --> c-ripple
  c-checkbox --> c-message
  c-pagination --> c-menu
  c-pagination --> c-icon-button
  c-pagination --> c-icon
  c-menu --> c-menu-items
  c-menu --> c-icon
  c-icon-button --> c-badge
  c-icon-button --> c-spinner
  c-icon-button --> c-ripple
  style c-data-table fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
