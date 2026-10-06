import {
  type CDataTableColumn,
  type CDataTableExpandedContext,
  type CDataTableRow,
  h,
} from '@cscfi/csc-ui';
import { CDataTable } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

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
      style: 'padding-inline: 6px',
      underline: true,
    },
    `Read more about ${row.name}`,
  );

export const Expansion = () => {
  const [expanded, setExpanded] = useState<string[]>([]);

  return (
    <div>
      {/* The description column has expansion: 'always' — it never renders as
          a table column, its cells live in the expansion row. The custom
          expandedContent renders after them. */}
      <CDataTable
        columns={columns}
        data={data}
        expandedContent={expandedContent}
        getRowId={getRowId}
        onChangeExpanded={(event) => setExpanded(event.detail as string[])}
        singleExpansion
      />

      <p>Expanded: {expanded.length ? expanded.join(', ') : '—'}</p>
    </div>
  );
};
