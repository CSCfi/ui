import type { CDataTableColumn, CDataTableRow } from '@cscfi/csc-ui';

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

const table = document.querySelector('c-data-table')!;
table.columns = columns;
table.data = data;
table.getRowId = getRowId;
table.selected = ['ds-2'];

const status = document.querySelector('p')!;

table.addEventListener('change:selected', (event) => {
  const { ids } = event.detail;

  status.textContent = `Selected ids: ${ids.length ? ids.join(', ') : '—'}`;
});
