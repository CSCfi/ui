// @ts-nocheck — documentation code sample; shown as text, never compiled here
import type { CDataTableColumn, CDataTableSort } from '@cscfi/csc-ui-next';

const columns: CDataTableColumn[] = [
  { header: 'Project', key: 'name', sortable: true },
  { align: 'end', header: 'Members', key: 'members', sortable: true },
  { header: 'Facility', key: 'facility' },
  { header: 'Created', key: 'created', sortable: true },
];

const data = [
  { created: '2026-01-14', facility: 'Puhti', members: 12, name: 'Aurora' },
  { created: '2026-02-02', facility: 'Mahti', members: 3, name: 'Borealis' },
  { created: '2026-02-19', facility: 'LUMI', members: 41, name: 'Cirrus' },
  { created: '2026-03-05', facility: 'Allas', members: 7, name: 'Drift' },
  { created: '2026-03-28', facility: 'Puhti', members: 18, name: 'Ember' },
  { created: '2026-04-11', facility: 'LUMI', members: 2, name: 'Fjord' },
  { created: '2026-05-01', facility: 'Mahti', members: 25, name: 'Glacier' },
  { created: '2026-05-23', facility: 'Allas', members: 9, name: 'Halo' },
];

const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const table = document.createElement('c-data-table');
table.columns = columns;
table.data = data;
table.sort = { column: 'name', direction: 'asc' };
table.setAttribute('page-size', '5');

const status = document.createElement('p');
status.textContent = 'Sorted by: name (asc)';

table.addEventListener('change:sort', (event) => {
  const sort = event.detail as CDataTableSort;
  status.textContent = `Sorted by: ${sort.column} (${sort.direction})`;
});

wrapper.append(table, status);
document.body.append(wrapper);
