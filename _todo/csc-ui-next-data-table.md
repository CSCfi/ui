# CDataTable (csc-ui-next)

Create a new data table component using tanstack table.

## Functionality

The data table component should have the following functionality:

- Easily customizable cells and rows
  - Maybe by exposing the Vue's render function to the consumer?
- Pinnable / hideable columns
- Expendable rows (with custom content)
- Selectable rows (all, partial, none)
- Sortable columns
- Pagination / page size selection
- Loading status indicator
- Option to make the header 'sticky'
- Option to make the footer 'sticky'
- 'Empty state' slot
- Caption sot
- Events to wire up external sorting, pagination and filtering
- Footer columns
- Light and dark modes with customizable css parts
- Customizable ui texts (for i18n etc)
- Optional autohide for overflowing columns
  - Move items to the expandable row when hidden
- Columns can be set to always open in the expandable row ('hidden' in column meta)
- Scrollable overflow if autohide not set
  - Expandable row content should be sticky and the width of the visible table area

The style should match the old stencil component
