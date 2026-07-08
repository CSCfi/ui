// @ts-nocheck — documentation code sample; shown as text, never compiled here
import type { CDataTableColumn, CDataTableRow } from '@cscfi/csc-ui-next';

const columns: CDataTableColumn[] = [
  { header: 'Dataset', key: 'name' },
  { align: 'end', header: 'Size (GB)', key: 'size' },
];

const data = Array.from({ length: 11 }, (_, i) => ({
  id: `ds-${i + 1}`,
  name: `Dataset ${i + 1}`,
  size: ((i * 37) % 90) + 4,
}));

// A stable row id keeps the selection correct across sorting and paging.
const getRowId = (row: CDataTableRow) => row.id as string;

const wrapper = document.createElement('div');

// With client-side data and pagination, selecting a full page offers a
// two-step "select all N rows" banner.
// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const table = document.createElement('c-data-table');
table.columns = columns;
table.data = data;
table.getRowId = getRowId;
table.selected = ['ds-2'];
table.setAttribute('page-size', '4');
table.setAttribute('selection', 'multiple');

const status = document.createElement('p');
status.textContent = 'Selected ids: ds-2';

table.addEventListener('change:selected', (event) => {
  const { ids } = event.detail as { ids: string[]; rows: CDataTableRow[] };

  status.textContent = `Selected ids: ${ids.length ? ids.join(', ') : '—'}`;
});

wrapper.append(table, status);
document.body.append(wrapper);
