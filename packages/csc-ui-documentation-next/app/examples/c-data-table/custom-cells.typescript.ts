import { type CDataTableColumn, h } from '@cscfi/csc-ui-next';

const message = document.querySelector('p')!;

const data = [
  { name: 'Aurora', status: 'active', usage: 0.72 },
  { name: 'Borealis', status: 'closed', usage: 0.13 },
  { name: 'Cirrus', status: 'pending', usage: 0.44 },
];

// Cell renderers are plain functions returning VNodes built with the `h`
// re-exported from @cscfi/csc-ui-next — no direct vue dependency needed.
const columns: CDataTableColumn[] = [
  { header: 'Project', key: 'name' },
  {
    cell: ({ value }) =>
      h('c-tag', { active: value === 'active' }, String(value)),
    header: 'Status',
    key: 'status',
  },
  {
    cell: ({ value }) =>
      h('c-progress-bar', {
        style: 'width: 160px',
        value: Math.round((value as number) * 100),
      }),
    header: 'Usage',
    key: 'usage',
  },
  {
    align: 'end',
    cell: ({ row }) =>
      h(
        'c-button',
        {
          onClick: () => {
            message.textContent = `Opening project ${row.name}…`;
          },
          size: 'small',
          text: true,
        },
        'Open',
      ),
    header: '',
    key: 'actions',
  },
];

const table = document.querySelector('c-data-table')!;
table.columns = columns;
table.data = data;
