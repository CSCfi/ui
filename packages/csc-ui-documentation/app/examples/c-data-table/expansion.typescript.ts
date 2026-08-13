import {
  type CDataTableColumn,
  type CDataTableExpandedContext,
  type CDataTableRow,
  h,
} from '@cscfi/csc-ui';

// The description column has expansion: 'always' — it never renders as a
// table column, its cells live in the expansion row. The custom
// expandedContent renders after them.
const columns: CDataTableColumn[] = [
  { header: 'Service', key: 'name' },
  { header: 'Category', key: 'category' },
  { expansion: 'always', header: 'Description', key: 'description' },
];

const data = [
  {
    category: 'Computing',
    description:
      'Supercomputer for medium-scale simulations and data analysis.',
    id: 'puhti',
    name: 'Puhti',
  },
  {
    category: 'Computing',
    description: 'Supercomputer for massively parallel workloads.',
    id: 'mahti',
    name: 'Mahti',
  },
  {
    category: 'Storage',
    description: 'Object storage for research data, accessible everywhere.',
    id: 'allas',
    name: 'Allas',
  },
];

const getRowId = (row: CDataTableRow) => row.id as string;

const expandedContent = ({ row }: CDataTableExpandedContext) =>
  h(
    'c-link',
    {
      href: `https://docs.csc.fi/computing/systems-${row.id}/`,
      underline: true,
      style: 'padding-inline: 6px',
    },
    `Read more about ${row.name}`,
  );

const table = document.querySelector('c-data-table')!;
table.columns = columns;
table.data = data;
table.expandedContent = expandedContent;
table.getRowId = getRowId;

const status = document.querySelector('p')!;

table.addEventListener('change:expanded', (event) => {
  const expanded = event.detail;

  status.textContent = `Expanded: ${expanded.length ? expanded.join(', ') : '—'}`;
});
