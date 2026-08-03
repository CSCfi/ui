import type { CDataTableColumn } from '@cscfi/csc-ui-next';

const columns: CDataTableColumn[] = [
  { header: 'Project', key: 'name', pinned: 'left' },
  { header: 'Owner', key: 'owner' },
  { header: 'Facility', key: 'facility' },
  { header: 'Quota', key: 'quota' },
  { header: 'Created', key: 'created' },
];

const data = [
  {
    created: '2026-01-14',
    facility: 'Puhti',
    name: 'Aurora',
    owner: 'aino.virtanen@example.fi',
    quota: '20 TB',
  },
  {
    created: '2026-02-02',
    facility: 'Mahti',
    name: 'Borealis',
    owner: 'eero.korhonen@example.fi',
    quota: '5 TB',
  },
  {
    created: '2026-02-19',
    facility: 'LUMI',
    name: 'Cirrus',
    owner: 'sofia.laine@example.fi',
    quota: '80 TB',
  },
];

const table = document.querySelector('c-data-table')!;
table.columns = columns;
table.data = data;
