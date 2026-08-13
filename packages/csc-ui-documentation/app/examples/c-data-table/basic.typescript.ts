import type { CDataTableColumn } from '@cscfi/csc-ui';

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

const table = document.querySelector('c-data-table')!;
table.columns = columns;
table.data = data;
table.sort = { column: 'name', direction: 'asc' };

const status = document.querySelector('p')!;

table.addEventListener('change:sort', (event) => {
  const sort = event.detail!;

  status.textContent = `Sorted by: ${sort.column} (${sort.direction})`;
});
